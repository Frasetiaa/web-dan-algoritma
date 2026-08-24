# Algoritma Sistem Jadwal Piket dan nginap

## 1. Tujuan

Sistem digunakan untuk jadwal piket dan nginap selama satu bulan secara otomatis

Sistem menghasilkan jadwal yang:

- Adil dalam pembagian tugas.
- Menghindari anggota bertugas berturut-turut kalau memungkinkan.
- Menghindari anggota piket dan menginap di hari yang sama.
- Memiliki jumlah tugas yang seimbang.
- Dapat dioptimalkan secara otomatis.
- Dapat diedit secara manual.
- Dapat berjalan sebagai static website tanpa backend.

---

## 2. Konfigurasi Sistem

Konfigurasi awal:

| Parameter | Nilai |
|---|---:|
| Tahun | 2026 |
| Bulan | September |
| Jumlah hari | 30 |
| Jumlah anggota | 15 |
| Piket per hari | 3 |
| Menginap per hari | 2 |

### Perhitungan Slot

```text
Total slot piket    = 30 × 3 = 90
Total slot nginap = 30 × 2 = 60
Total seluruh tugas = 90 + 60 = 150
