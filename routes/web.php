<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'      => Route::has('login'),
        'canRegister'   => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'    => PHP_VERSION,
    ]);
});

// ── Dashboard ────────────────────────────────────────────────────────────────
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// ── Authenticated Routes ─────────────────────────────────────────────────────
Route::middleware(['auth'])->group(function () {

    // Dashboard JSON stats
    Route::get('/dashboard/stats', function () {
        $user          = request()->user();
        $institutionId = $user->institution_id;

        $studentQuery    = \App\Models\Student::query();
        $attendanceQuery = \App\Models\Attendance::query();
        $bannerQuery     = \App\Models\Banner::where('is_active', true);

        if ($institutionId) {
            $studentQuery->where('institution_id', $institutionId);
            $attendanceQuery->where('institution_id', $institutionId);
            $bannerQuery->where(function ($q) use ($institutionId) {
                $q->whereNull('institution_id')->orWhere('institution_id', $institutionId);
            });
        }

        $today      = now()->toDateString();
        $todayStats = (clone $attendanceQuery)->where('date', $today)
            ->selectRaw('status, count(*) as cnt')->groupBy('status')
            ->pluck('cnt', 'status');

        $start  = now()->subDays(6)->toDateString();
        $weekly = (clone $attendanceQuery)
            ->whereBetween('date', [$start, $today])
            ->selectRaw('date, status, count(*) as cnt')
            ->groupBy('date', 'status')
            ->orderBy('date')
            ->get()
            ->groupBy('date')
            ->map(fn($rows, $date) => [
                'date'     => $date,
                'total'    => $rows->sum('cnt'),
                'puntual'  => $rows->where('status', 'PUNTUAL')->sum('cnt'),
                'tardanza' => $rows->where('status', 'TARDANZA')->sum('cnt'),
            ])->values();

        return response()->json([
            'institutions'     => \App\Models\Institution::count(),
            'students'         => $studentQuery->where('is_active', true)->count(),
            'attendancesToday' => $todayStats->sum(),
            'punctualToday'    => $todayStats->get('PUNTUAL', 0),
            'tardanzasToday'   => $todayStats->get('TARDANZA', 0),
            'banners'          => $bannerQuery->count(),
            'weeklyData'       => $weekly,
        ]);
    })->name('dashboard.stats');

    // Institutions
    Route::resource('institutions', InstitutionController::class)->except(['create', 'show', 'edit']);
    Route::post('institutions/{institution}/schedules', [\App\Http\Controllers\InstitutionScheduleController::class, 'store'])->name('schedules.store');
    Route::delete('schedules/{schedule}', [\App\Http\Controllers\InstitutionScheduleController::class, 'destroy'])->name('schedules.destroy');

    // Students
    Route::post('/students', [\App\Http\Controllers\StudentController::class, 'store'])->name('students.store');
    Route::post('/students/upload', [\App\Http\Controllers\StudentController::class, 'uploadExcel'])->name('students.upload');

    // DB endpoints (web-auth, no 401)
    Route::get('/database/students', [\App\Http\Controllers\StudentController::class, 'index'])->name('students.database');
    Route::put('/database/students/{student}', [\App\Http\Controllers\StudentController::class, 'update'])->name('students.database.update');
    Route::delete('/database/students/{student}', [\App\Http\Controllers\StudentController::class, 'destroy'])->name('students.database.destroy');
    Route::post('/database/students/{student}/photo', [\App\Http\Controllers\StudentController::class, 'uploadPhoto'])->name('students.photo');
    Route::post('/database/students/photo/dni/{dni}', [\App\Http\Controllers\StudentController::class, 'uploadPhotoByDni'])->name('students.photo.dni');
    Route::apiResource('/database/users', \App\Http\Controllers\UserController::class)->names('database.users');
    Route::get('/database/institutions', [InstitutionController::class, 'jsonIndex'])->name('database.institutions');
    Route::apiResource('/database/banners', \App\Http\Controllers\BannerController::class)->names('database.banners');
    Route::post('/database/banners/{banner}/toggle', [\App\Http\Controllers\BannerController::class, 'toggle'])->name('database.banners.toggle');

    // Attendance scanner
    Route::post('/attendance/register', [AttendanceController::class, 'register'])->name('attendance.register');

    // Inertia pages
    Route::get('/students', function () {
        return Inertia::render('Students/Index', [
            'institutions' => \App\Models\Institution::all()
        ]);
    })->name('students.index');

    Route::get('/banners', function () {
        return Inertia::render('Banners/Index', [
            'banners' => \App\Models\Banner::all()
        ]);
    })->name('banners.index');

    Route::get('/schedules', function () {
        return Inertia::render('Schedules/Index', [
            'schedules'    => \App\Models\Schedule::all(),
            'institutions' => \App\Models\Institution::all()
        ]);
    })->name('schedules.index');

    Route::get('/reports', [AttendanceController::class, 'index'])->name('reports.index');
    Route::get('/reports/json', [AttendanceController::class, 'jsonReport'])->name('reports.json');
    Route::get('/reports/export', [AttendanceController::class, 'exportExcel'])->name('reports.export');

    Route::get('/profiles', function () {
        return \Inertia\Inertia::render('Profiles/Index');
    })->name('profiles.index');

    Route::get('/photos', function () {
        return \Inertia\Inertia::render('Photos/Index');
    })->name('photos.index');

    Route::get('/scanner', [AttendanceController::class, 'scanner'])->name('scanner');
});

// ── Public Routes ─────────────────────────────────────────────────────────────
Route::get('/', [PublicController::class, 'index'])->name('home');

Route::get('/consulta', function (Request $request) {
    if (!$request->has('institution_id')) return redirect()->route('home');
    $institutionId = $request->query('institution_id');
    return \Inertia\Inertia::render('Public/Consulta', [
        'institution' => \App\Models\Institution::findOrFail($institutionId),
        'banners'     => \App\Models\Banner::where('is_active', true)
            ->where(function ($q) use ($institutionId) {
                $q->whereNull('institution_id')->orWhere('institution_id', $institutionId);
            })->orderBy('order')->get()
    ]);
})->name('public.consulta');

Route::get('/resultado/{codigo}', [PublicController::class, 'showRecord'])->name('public.resultado');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
