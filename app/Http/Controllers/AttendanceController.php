<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Institution;
use App\Models\Student;
use App\Models\InstitutionSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Reports/Index');
    }

    /**
     * JSON endpoint for the React Reports page.
     * When a student search is provided, it fills in FALTA for absent days.
     */
    public function jsonReport(Request $request)
    {
        $user      = $request->user();
        $startDate = $request->filled('start_date') ? $request->start_date : null;
        $endDate   = $request->filled('end_date')   ? $request->end_date   : null;
        $search    = $request->filled('search')     ? $request->search     : null;

        $query = Attendance::with('student');

        if ($user->institution_id) {
            $query->where('institution_id', $user->institution_id);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }

        if ($search) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                  ->orWhere('last_name_paternal', 'like', "%$search%")
                  ->orWhere('student_code', 'like', "%$search%");
            });
        }

        $attendances = $query->latest('date')->latest('time')->get();

        $logs = $attendances->map(function ($a) {
            return [
                'id'          => $a->id,
                'date'        => $a->date,
                'time'        => $a->time,
                'status'      => $a->status,
                'studentName' => $a->student
                    ? "{$a->student->last_name_paternal} {$a->student->last_name_maternal}, {$a->student->first_name}"
                    : 'N/A',
                'grade'       => $a->student ? "{$a->student->grade} - {$a->student->section}" : '—',
            ];
        });

        // Inject FALTA rows only when searching a specific student in a date range
        if ($search && $startDate && $endDate && $attendances->isNotEmpty()) {
            try {
                $studentIds = $attendances->pluck('student_id')->unique();
                if ($studentIds->count() === 1) {
                    $student = $attendances->first()?->student;
                    if ($student) {
                        $existingDates = $attendances->pluck('date')->map(fn($d) => substr($d, 0, 10))->toArray();
                        $period = new \DatePeriod(
                            new \DateTime($startDate),
                            new \DateInterval('P1D'),
                            (new \DateTime($endDate))->modify('+1 day')
                        );
                        $faltaRows = [];
                        foreach ($period as $day) {
                            $dayStr = $day->format('Y-m-d');
                            $dow    = (int) $day->format('N'); // 1=Mon…7=Sun
                            if ($dow >= 6) continue;           // skip weekends
                            if (!in_array($dayStr, $existingDates)) {
                                $faltaRows[] = [
                                    'id'          => 'falta-' . $dayStr,
                                    'date'        => $dayStr,
                                    'time'        => null,
                                    'status'      => 'FALTA',
                                    'studentName' => "{$student->last_name_paternal} {$student->last_name_maternal}, {$student->first_name}",
                                    'grade'       => "{$student->grade} - {$student->section}",
                                ];
                            }
                        }
                        $logs = $logs->merge($faltaRows)->sortByDesc('date')->values();
                    }
                }
            } catch (\Exception $e) {
                // Return original logs if period generation fails
                return response()->json($logs);
            }
        }

        return response()->json($logs);
    }

    public function exportExcel(Request $request)
    {
        $user      = $request->user();
        $startDate = $request->filled('start_date') ? $request->start_date : null;
        $endDate   = $request->filled('end_date')   ? $request->end_date   : null;
        $search    = $request->filled('search')     ? $request->search     : null;

        $query = Attendance::with('student');

        if ($user->institution_id) {
            $query->where('institution_id', $user->institution_id);
        }
        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }
        if ($search) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                  ->orWhere('last_name_paternal', 'like', "%$search%")
                  ->orWhere('student_code', 'like', "%$search%");
            });
        }

        $rows = $query->latest('date')->latest('time')->get()->map(function ($a) {
            return [
                'Fecha'  => $a->date   ? substr($a->date, 0, 10) : '',
                'Hora'   => $a->time   ? substr($a->time, 0, 5)  : '',
                'Alumno' => $a->student
                    ? "{$a->student->last_name_paternal} {$a->student->last_name_maternal}, {$a->student->first_name}"
                    : 'N/A',
                'Código' => $a->student?->student_code ?? '',
                'Grado'  => $a->student ? "{$a->student->grade} {$a->student->section}" : '',
                'Nivel'  => $a->student?->level ?? '',
                'Turno'  => $a->student?->shift ?? '',
                'Estado' => $a->status,
            ];
        });

        $headers = count($rows) ? array_keys($rows->first()) : ['Sin datos'];
        $csv     = implode(',', $headers) . "\n";
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(fn($v) => '"' . str_replace('"', '""', (string) $v) . '"', $row)) . "\n";
        }

        $filename = $startDate
            ? "reporte_asistencia_{$startDate}_al_{$endDate}.csv"
            : 'reporte_asistencia_general.csv';

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function scanner()
    {
        $user        = auth()->user();
        $institution = null;

        if ($user->institution_id) {
            $institution = Institution::find($user->institution_id);
        }

        return Inertia::render('Scanner/Index', [
            'institution' => $institution,
            'statsToday'  => $institution
                ? Attendance::where('institution_id', $institution->id)->whereDate('date', now())->count()
                : 0,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate(['student_code' => 'required|string']);

        $user          = $request->user();
        $institutionId = $user->institution_id;

        $student = Student::where('student_code', $request->student_code)
            ->where('institution_id', $institutionId)
            ->first();

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Alumno no encontrado'], 404);
        }
        if (!$student->is_active) {
            return response()->json(['success' => false, 'message' => 'Alumno inactivo'], 403);
        }

        $now      = now();
        $schedule = InstitutionSchedule::where('institution_id', $institutionId)
            ->where('level', $student->level)
            ->where('shift', $student->shift)
            ->first();

        $entryTime = $schedule ? $schedule->entry_time : '08:00:00';
        $tolerance = $schedule ? $schedule->tolerance_minutes : 15;

        try {
            $limit = Carbon::createFromFormat('H:i:s', $entryTime);
        } catch (\Exception $e) {
            $limit = Carbon::createFromFormat('H:i', $entryTime);
        }
        $limit->setDate($now->year, $now->month, $now->day)->addMinutes($tolerance);
        $status = $now->greaterThan($limit) ? 'TARDANZA' : 'PUNTUAL';

        Attendance::create([
            'student_id'     => $student->id,
            'institution_id' => $institutionId,
            'date'           => $now->toDateString(),
            'time'           => $now->toTimeString(),
            'status'         => $status,
            'entry_method'   => 'SCAN',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'student' => [
                    'id'        => $student->id,
                    'full_name' => "{$student->first_name} {$student->last_name_paternal}",
                    'photo_url' => $student->photo_url,
                    'grade'     => $student->grade,
                    'section'   => $student->section,
                    'level'     => $student->level,
                ],
                'attendance' => [
                    'status' => $status,
                    'time'   => $now->format('h:i A'),
                    'date'   => $now->format('d/m/Y'),
                ],
            ],
        ]);
    }

    public function stats(Request $request)
    {
        $institutionId = $request->user()->institution_id;
        $today = now()->toDateString();
        $query = Attendance::where('date', $today);

        if ($institutionId) {
            $query->where('institution_id', $institutionId);
        }

        $stats = $query->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status');

        return response()->json([
            'total'     => $stats->sum(),
            'presentes' => $stats->get('PUNTUAL', 0),
            'tardanzas' => $stats->get('TARDANZA', 0),
        ]);
    }

    public function logs(Request $request)
    {
        $institutionId = $request->user()->institution_id;
        $query         = Attendance::with('student');

        if ($institutionId) {
            $query->where('institution_id', $institutionId);
        }

        return $query->latest()->limit(100)->get();
    }

    public function weeklyStats(Request $request)
    {
        $institutionId = $request->user()->institution_id;
        $start         = now()->subDays(6)->toDateString();
        $end           = now()->toDateString();

        $query = Attendance::whereBetween('date', [$start, $end]);
        if ($institutionId) {
            $query->where('institution_id', $institutionId);
        }

        return response()->json(
            $query->selectRaw('date, status, count(*) as count')->groupBy('date', 'status')->get()
        );
    }
}
