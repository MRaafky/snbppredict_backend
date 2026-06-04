# Dataset SNBPredict

Dataset ini berasal dari tim Data Scientist (CAPSTONE-PROJECT).

## File

| File | Baris | Keterangan |
|------|-------|------------|
| `cleaned_data.csv` | 5.035 | **Dataset utama** — sudah di-clean, digunakan di backend |
| `student_performance.csv` | 5.100 | Dataset lengkap dengan kolom tambahan (exercise_minutes, caffeine_intake_mg, dll) |

## Kolom `cleaned_data.csv` (digunakan backend)

- `student_id`, `age`, `gender`, `academic_level`
- `study_hours`, `self_study_hours`, `online_classes_hours`
- `social_media_hours`, `gaming_hours`, `sleep_hours`, `screen_time_hours`
- `internet_quality`, `mental_health_score`
- `focus_index`, `burnout_level`, `productivity_score`
- `exam_score` ← target prediksi

## Integrasi

Data dari `cleaned_data.csv` sudah dimuat ke `src/config/dataStore.js` sebagai in-memory fallback
ketika database PostgreSQL tidak tersedia.
