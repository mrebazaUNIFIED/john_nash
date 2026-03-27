<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Super Administrador',
                'email' => 'admin@adec.edu.pe',
                'password' => bcrypt('admin'),
                'role' => 'SUPER_ADMIN',
            ]
        );
    }
}
