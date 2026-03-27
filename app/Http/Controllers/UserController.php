<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = User::query();

        if ($user->role !== 'SUPER_ADMIN' && $user->role !== 'ADMIN_GENERAL') {
            $query->where('institution_id', $user->institution_id);
        }

        return $query->with('institution')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|in:SUPER_ADMIN,ADMIN_GENERAL,ADMIN_COLEGIO,PORTERO',
            'institution_id' => 'nullable|exists:institutions,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'institution_id' => $validated['institution_id'],
        ]);

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        return $user->load('institution');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'sometimes|required|string|in:SUPER_ADMIN,ADMIN_GENERAL,ADMIN_COLEGIO,PORTERO',
            'institution_id' => 'nullable|exists:institutions,id',
        ]);

        $user->update($validated);

        if ($request->has('password')) {
            $request->validate(['password' => ['required', 'confirmed', Rules\Password::defaults()]]);
            $user->update(['password' => Hash::make($request->password)]);
        }

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
