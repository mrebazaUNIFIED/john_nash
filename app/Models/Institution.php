<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'logo_url', 'is_active'];
    protected $appends = ['status'];

    public function getStatusAttribute()
    {
        return $this->is_active ? 'active' : 'inactive';
    }
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function schedules()
    {
        return $this->hasMany(InstitutionSchedule::class);
    }

    public function banners()
    {
        return $this->hasMany(Banner::class);
    }
}
