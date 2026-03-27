<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\Banner::query();

        if ($user->role !== 'SUPER_ADMIN' && $user->role !== 'ADMIN_GENERAL') {
            $query->where('institution_id', $user->institution_id);
        }

        return $query->with('institution')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|image|max:5120',
            'target_url' => 'nullable|url',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'institution_id' => 'nullable|exists:institutions,id',
            'position' => 'required|string|in:left,right,top,bottom',
        ]);

        $banner = new \App\Models\Banner($validated);
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $banner->image_url = \Illuminate\Support\Facades\Storage::url($path);
        }

        $banner->save();

        return response()->json($banner, 201);
    }

    public function update(Request $request, \App\Models\Banner $banner)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|max:5120',
            'target_url' => 'nullable|url',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date',
            'institution_id' => 'nullable|exists:institutions,id',
            'position' => 'sometimes|required|string|in:left,right,top,bottom',
        ]);

        $banner->fill($validated);

        if ($request->hasFile('image')) {
            if ($banner->image_url) {
                $oldPath = str_replace('/storage/', '', $banner->image_url);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('banners', 'public');
            $banner->image_url = \Illuminate\Support\Facades\Storage::url($path);
        }

        $banner->save();

        return response()->json($banner);
    }

    public function destroy(\App\Models\Banner $banner)
    {
        if ($banner->image_url) {
            $oldPath = str_replace('/storage/', '', $banner->image_url);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
        }
        $banner->delete();

        return response()->json(['message' => 'Banner eliminado']);
    }

    public function toggle(\App\Models\Banner $banner)
    {
        $banner->is_active = !$banner->is_active;
        $banner->save();

        return response()->json($banner);
    }

    public function publicBanners(Request $request)
    {
        $institutionId = $request->query('institution_id');
        
        $query = \App\Models\Banner::where('is_active', true)
            ->where(function($q) use ($institutionId) {
                $q->whereNull('institution_id');
                if ($institutionId) {
                    $q->orWhere('institution_id', $institutionId);
                }
            });

        return $query->get();
    }
}
