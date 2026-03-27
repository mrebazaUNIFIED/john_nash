<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    // Public routes
    Route::get('/public/student/check', [App\Http\Controllers\PublicController::class, 'checkStudentStatus']);
    Route::get('/public/student/{code}', [App\Http\Controllers\PublicController::class, 'showRecord']);
    Route::get('/public/banners', [App\Http\Controllers\BannerController::class, 'publicBanners']);

    // Auth required routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user()->load('institution');
        });

        // Institutions
        Route::apiResource('institutions', App\Http\Controllers\InstitutionController::class);

        // Students
        Route::apiResource('students', App\Http\Controllers\StudentController::class);
        Route::post('/students/upload', [App\Http\Controllers\StudentController::class, 'uploadExcel']);
        Route::post('/students/{student}/photo', [App\Http\Controllers\StudentController::class, 'uploadPhoto']);
        Route::post('/students/photo-by-dni/{dni}', [App\Http\Controllers\StudentController::class, 'uploadPhotoByDni']);

        // Attendance
        Route::post('/attendance/register', [App\Http\Controllers\AttendanceController::class, 'register']);
        Route::get('/attendance/stats', [App\Http\Controllers\AttendanceController::class, 'stats']);
        Route::get('/attendance/logs', [App\Http\Controllers\AttendanceController::class, 'logs']);
        Route::get('/attendance/stats/weekly', [App\Http\Controllers\AttendanceController::class, 'weeklyStats']);
        Route::get('/attendance/report', [App\Http\Controllers\AttendanceController::class, 'report']);
        Route::get('/attendance/report/export', [App\Http\Controllers\AttendanceController::class, 'exportExcel']);

        // Banners
        Route::apiResource('banners', App\Http\Controllers\BannerController::class)->except(['show']);
        Route::patch('/banners/{banner}/toggle', [App\Http\Controllers\BannerController::class, 'toggle']);

        // Schedules
        Route::apiResource('schedules', App\Http\Controllers\ScheduleController::class);

        // Users
        Route::apiResource('users', App\Http\Controllers\UserController::class);
    });
});
