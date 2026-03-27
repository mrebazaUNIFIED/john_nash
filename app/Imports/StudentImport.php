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
        // Map common column names from previous Node project or typical Excels
        $codigo = $row['codigo'] ?? $row['id_alumno'] ?? $row['student_code'] ?? null;
        $firstName = $row['nombres'] ?? $row['first_name'] ?? null;
        $lastNamePaternal = $row['apellido_paterno'] ?? $row['last_name_paternal'] ?? null;
        
        if (!$codigo || !$firstName || !$lastNamePaternal) {
            return null;
        }

        $this->importedCount++;

        return new Student([
            'institution_id' => $this->institutionId,
            'student_code' => (string)$codigo,
            'first_name' => $firstName,
            'last_name_paternal' => $lastNamePaternal,
            'last_name_maternal' => $row['apellido_materno'] ?? $row['last_name_maternal'] ?? '',
            'level' => $this->level,
            'shift' => $this->shift,
            'grade' => $row['grado'] ?? $row['grade'] ?? '',
            'section' => $row['seccion'] ?? $row['section'] ?? '',
            'is_active' => true,
        ]);
    }
}
