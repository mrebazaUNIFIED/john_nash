<?php

namespace App\Imports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Str;

class StudentImport implements ToModel, WithHeadingRow
{
    private $institutionId;
    private $level;
    private $shift;
    public $importedCount = 0;

    public function __construct($institutionId, $level, $shift)
    {
        $this->institutionId = $institutionId;
        $this->level = $level;
        $this->shift = $shift;
    }

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Normalize keys (remove accents, lowercase, replace spaces)
        $normalizedRow = [];
        foreach ($row as $key => $value) {
            // First try to remove accents manually or using Str::slug
            $slugKey = str_replace('-', '', Str::slug($key));
            $normalizedRow[$slugKey] = $value;
            
            // Also keep a version without any non-alphanumeric (old method)
            $cleanKey = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $key));
            $normalizedRow[$cleanKey] = $value;
        }

        // Map column names with multiple aliases
        $codigo = $normalizedRow['numerodedocumento'] ?? $normalizedRow['nrodocumento'] ?? $normalizedRow['documento'] ?? $normalizedRow['codigo'] ?? $normalizedRow['idalumno'] ?? $normalizedRow['studentcode'] ?? $normalizedRow['dni'] ?? $row['dni'] ?? null;
        $firstName = $normalizedRow['nombres'] ?? $normalizedRow['firstname'] ?? $normalizedRow['nombre'] ?? null;
        $lastNamePaternal = $normalizedRow['apellidopaterno'] ?? $normalizedRow['lastnamepaternal'] ?? $normalizedRow['paterno'] ?? $normalizedRow['apellidop'] ?? null;
        $lastNameMaternal = $normalizedRow['apellidomaterno'] ?? $normalizedRow['lastnamematernal'] ?? $normalizedRow['materno'] ?? $normalizedRow['apellidom'] ?? '';
        
        // If not found in normalized, try original row keys
        if (!$codigo) $codigo = $row['codigo'] ?? $row['id_alumno'] ?? $row['student_code'] ?? null;
        if (!$firstName) $firstName = $row['nombres'] ?? $row['first_name'] ?? $row['nombre'] ?? null;
        if (!$lastNamePaternal) $lastNamePaternal = $row['apellido_paterno'] ?? $row['last_name_paternal'] ?? $row['paterno'] ?? null;

        if (!$codigo || !$firstName || !$lastNamePaternal) {
            return null;
        }

        $this->importedCount++;

        return new Student([
            'institution_id' => $this->institutionId,
            'student_code' => (string)$codigo,
            'first_name' => $firstName,
            'last_name_paternal' => $lastNamePaternal,
            'last_name_maternal' => $lastNameMaternal ?: ($row['apellido_materno'] ?? $row['last_name_maternal'] ?? ''),
            'level' => $this->level,
            'shift' => $this->shift,
            'grade' => $normalizedRow['grado'] ?? $normalizedRow['grade'] ?? $row['grado'] ?? $row['grade'] ?? '',
            'section' => $normalizedRow['seccion'] ?? $normalizedRow['seccin'] ?? $normalizedRow['section'] ?? $row['seccion'] ?? $row['section'] ?? '',
            'is_active' => true,
        ]);
    }
}
