<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'institution_id', 'title', 'image_url', 'target_url', 'start_date', 'end_date', 'is_active', 'position', 'order'
    ];

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }
}
