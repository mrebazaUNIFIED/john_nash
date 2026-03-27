<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstitutionSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'institution_id', 'level', 'shift', 'entry_time', 'tolerance_minutes', 'is_active'
    ];

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }
}
