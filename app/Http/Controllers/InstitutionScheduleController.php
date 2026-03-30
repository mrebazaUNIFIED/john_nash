<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\InstitutionSchedule;
use Illuminate\Http\Request;

class InstitutionScheduleController extends Controller
{
    public function store(Request $request, Institution $institution)
    {
        $validated = $request->validate([
            'shift' => 'required|string|max:20',
            'level' => 'required|string|max:20',
            'entry_time' => 'required|date_format:H:i',
            'tolerance_minutes' => 'required|integer|min:0',
        ]);

        $institution->schedules()->create([
            'shift' => $validated['shift'],
            'level' => $validated['level'],
            'entry_time' => $validated['entry_time'],
            'tolerance_minutes' => $validated['tolerance_minutes'],
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Horario añadido exitosamente.');
    }

    public function destroy(InstitutionSchedule $schedule)
    {
        $schedule->delete();
        return redirect()->back()->with('success', 'Horario eliminado.');
    }
}
