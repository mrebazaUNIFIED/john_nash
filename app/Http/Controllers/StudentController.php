<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\StudentImport;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\Student::with('institution');

        if ($user->role === 'ADMIN_COLEGIO') {
            $query->where('institution_id', $user->institution_id);
        } elseif ($request->filled('institution_id')) {
            $query->where('institution_id', $request->input('institution_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                  ->orWhere('last_name_paternal', 'like', "%$search%")
                  ->orWhere('last_name_maternal', 'like', "%$search%")
                  ->orWhere('student_code', 'like', "%$search%");
            });
        }

        if ($request->filled('level')) {
            $query->where('level', $request->input('level'));
        }

        if ($request->filled('shift')) {
            $query->where('shift', $request->input('shift'));
        }

        return $query->paginate($request->input('limit', 10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'institution_id' => 'required_if:user_role,SUPER_ADMIN,ADMIN_GENERAL|exists:institutions,id',
            'student_code' => 'required|string|max:50',
            'first_name' => 'required|string|max:255',
            'last_name_paternal' => 'required|string|max:255',
            'last_name_maternal' => 'nullable|string|max:255',
            'grade' => 'nullable|string|max:50',
            'section' => 'nullable|string|max:50',
            'level' => 'required|string|max:100',
            'shift' => 'required|string|max:100',
            'is_active' => 'boolean',
        ]);

        if ($user->role === 'ADMIN_COLEGIO') {
            $validated['institution_id'] = $user->institution_id;
        }

        $student = \App\Models\Student::create($validated);

        return response()->json($student, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(\App\Models\Student $student)
    {
        return $student->load('institution');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, \App\Models\Student $student)
    {
        $validated = $request->validate([
            'institution_id' => 'nullable|exists:institutions,id',
            'student_code' => 'sometimes|required|string|max:50',
            'first_name' => 'sometimes|required|string|max:255',
            'last_name_paternal' => 'sometimes|required|string|max:255',
            'last_name_maternal' => 'nullable|string|max:255',
            'grade' => 'nullable|string|max:50',
            'section' => 'nullable|string|max:50',
            'level' => 'sometimes|required|string|max:100',
            'shift' => 'sometimes|required|string|max:100',
            'is_active' => 'boolean',
        ]);

        $student->update($validated);

        return response()->json($student);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\Student $student)
    {
        $student->update(['is_active' => false]);
        return response()->json(['message' => 'Alumno desactivado correctamente']);
    }

    public function uploadPhoto(Request $request, \App\Models\Student $student)
    {
        $request->validate([
            'photo' => 'required|image|max:2048',
        ]);

        if ($student->photo_url) {
            $oldPath = str_replace('/storage/', '', $student->photo_url);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $path = $request->file('photo')->store("students/{$student->institution_id}", 'public');
        $student->photo_url = Storage::url($path);
        
        // Ensure the URL starts with / if it doesn't
        if (!str_starts_with($student->photo_url, '/')) {
            $student->photo_url = '/' . $student->photo_url;
        }
        
        $student->save();

        return response()->json(['photo_url' => $student->photo_url]);
    }

    public function uploadPhotoByDni(Request $request, $dni)
    {
        $user = $request->user();
        $query = \App\Models\Student::where('student_code', $dni);
        
        if ($user->role === 'ADMIN_COLEGIO') {
            $query->where('institution_id', $user->institution_id);
        }
        
        $student = $query->firstOrFail();

        return $this->uploadPhoto($request, $student);
    }

    public function uploadExcel(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'file'           => 'required|mimes:xlsx,xls,csv|max:10240',
            'level'          => 'required|string',
            'shift'          => 'required|string',
            'institution_id' => ($user->role === 'ADMIN_COLEGIO') ? 'nullable' : 'required|exists:institutions,id',
        ]);

        // Use the user's institution if they are ADMIN_COLEGIO
        $institutionId = ($user->role === 'ADMIN_COLEGIO')
            ? $user->institution_id
            : $request->institution_id;

        if (!$institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo determinar la institución destino.'
            ], 422);
        }

        try {
            $import = new StudentImport(
                $institutionId,
                $request->level,
                $request->shift
            );

            Excel::import($import, $request->file('file'));

            return response()->json([
                'success'   => true,
                'imported'  => $import->importedCount,
                'processed' => $import->importedCount,
                'message'   => 'Carga masiva completada exitosamente.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el archivo: ' . $e->getMessage()
            ], 500);
        }
    }
}
