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
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'status' => $validated['status'],
            'is_active' => $validated['status'] === 'active',
            'logo_url' => $logoUrl
        ]);

        return redirect()->back();
    }

    public function update(Request $request, string $id)
    {
        $institution = Institution::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
            'logo_file' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo_file')) {
            // Eliminar imagen anterior si se usara Storage local
            $path = $request->file('logo_file')->store('institutions', 'public');
            $institution->logo_url = '/storage/' . $path;
        }

        $institution->name = $validated['name'];
        $institution->slug = Str::slug($validated['name']);
        $institution->status = $validated['status'];
        $institution->is_active = $validated['status'] === 'active';
        $institution->save();

        return redirect()->back();
    }

    public function destroy(string $id)
    {
        $institution = Institution::findOrFail($id);
        $institution->delete();
        
        return redirect()->back();
    }
}
