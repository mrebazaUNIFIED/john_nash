<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Institution;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class InstitutionController extends Controller
{
    public function index()
    {
        return Inertia::render('Institutions/Index', [
            'institutions' => Institution::with('schedules')->orderBy('id', 'asc')->get()
        ]);
    }

    public function jsonIndex()
    {
        return response()->json(Institution::orderBy('name')->get(['id', 'name', 'slug']));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
            'logo_file' => 'nullable|image|max:2048',
        ]);

        $logoUrl = null;
        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('institutions', 'public');
            $logoUrl = '/storage/' . $path;
        }

        Institution::create([
            'name'      => $validated['name'],
            'slug'      => Str::slug($validated['name']),
            'is_active' => $validated['status'] === 'active',
            'logo_url'  => $logoUrl,
        ]);

        return redirect()->back()->with('success', 'Institución creada correctamente.');
    }

    public function update(Request $request, string $id)
    {
        $institution = Institution::findOrFail($id);

        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'status'    => 'required|in:active,inactive',
            'logo_file' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo_file')) {
            // Eliminar imagen anterior si existe
            if ($institution->logo_url) {
                $oldPath = str_replace('/storage/', '', $institution->logo_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $path = $request->file('logo_file')->store('institutions', 'public');
            $institution->logo_url = '/storage/' . $path;
        }

        $institution->name      = $validated['name'];
        $institution->slug      = Str::slug($validated['name']);
        $institution->is_active = $validated['status'] === 'active';
        $institution->save();

        return redirect()->back()->with('success', 'Institución actualizada correctamente.');
    }

    public function destroy(string $id)
    {
        $institution = Institution::findOrFail($id);
        $institution->delete();
        
        return redirect()->back();
    }
}
