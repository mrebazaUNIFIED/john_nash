<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'institution_id', 'student_code', 'first_name', 'last_name_paternal',
        'last_name_maternal', 'grade', 'section', 'level', 'shift',
        'photo_url', 'is_active'
    ];

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }
}
