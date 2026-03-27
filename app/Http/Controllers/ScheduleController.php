<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\InstitutionSchedule::query();

        if ($user->role === 'ADMIN_COLEGIO') {
            $query->where('institution_id', $user->institution_id);
        }

        return $query->with('institution')->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'institution_id' => 'required_if:user_role,SUPER_ADMIN,ADMIN_GENERAL|exists:institutions,id',
            'level' => 'required|string',
            'shift' => 'required|string',
            'entry_time' => 'required|date_format:H:i',
            'tolerance_minutes' => 'required|integer|min:0',
        ]);

        if ($user->role === 'ADMIN_COLEGIO') {
            $validated['institution_id'] = $user->institution_id;
        }

        $schedule = \App\Models\InstitutionSchedule::create($validated);

        return response()->json($schedule, 201);
    }

    public function show(\App\Models\InstitutionSchedule $schedule)
    {
        return $schedule->load('institution');
    }

    public function update(Request $request, \App\Models\InstitutionSchedule $schedule)
    {
        $validated = $request->validate([
            'level' => 'sometimes|required|string',
            'shift' => 'sometimes|required|string',
            'entry_time' => 'sometimes|required|date_format:H:i',
            'tolerance_minutes' => 'sometimes|required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $schedule->update($validated);

        return response()->json($schedule);
    }

    public function destroy(\App\Models\InstitutionSchedule $schedule)
    {
        $schedule->delete();
        return response()->json(['message' => 'Horario eliminado']);
    }
}
