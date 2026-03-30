<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Institution;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function index()
    {
        return Inertia::render('Public/Landing', [
            'banners' => Banner::where('is_active', true)
                ->whereNull('institution_id')
                ->latest()
                ->take(2)
                ->get(),
            'institutions' => Institution::where('is_active', true)->get()
        ]);
    }

    public function checkStudentStatus(Request $request)
    {
        $request->validate([
            'student_code' => 'required',
            'institution_id' => 'required|exists:institutions,id'
        ]);

        $student = Student::where('student_code', $request->student_code)
            ->where('institution_id', $request->institution_id)
            ->first();

        if (!$student) {
            return response()->json(['message' => 'Alumno no encontrado'], 404);
        }

        return response()->json(['success' => true]);
    }

    public function showRecord(Request $request, $codigo)
    {
        $institutionId = $request->query('institution_id');
        
        $student = Student::where('student_code', $codigo)
            ->where('institution_id', $institutionId)
            ->firstOrFail();

        $todayRecord = Attendance::where('student_id', $student->id)
            ->whereDate('date', now())
            ->first();

        $history = Attendance::where('student_id', $student->id)
            ->orderBy('date', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Public/Resultado', [
            'student' => [
                'id' => $student->id,
                'codigo' => $student->student_code,
                'first_name' => $student->first_name,
                'last_name_paternal' => $student->last_name_paternal,
                'photo_url' => $student->photo_url,
                'grade' => $student->grade,
                'section' => $student->section,
                'level' => $student->level,
                'shift' => $student->shift
            ],
            'institution' => Institution::find($institutionId),
            'todayRecord' => $todayRecord,
            'history' => $history,
            'banners' => Banner::where('is_active', true)
                ->where('institution_id', $institutionId)
                ->orderBy('order')
                ->get()
        ]);
    }
}
