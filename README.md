# Catatan Pengeluaran — Web

Versi web dari aplikasi CLI "Catatan Pengeluaran". Tampilan baru (HTML/CSS/JS)
dijalankan lewat server Flask yang langsung memanggil logic Python asli di
folder `function/` — bukan simulasi, data betulan tersimpan ke
`data/data_pengeluaran.json` dan ekspor betulan memakai `pandas`.

## Struktur proyek

```
expence_tracer/
├── app.py                     # server Flask + endpoint API
├── main.py                    # CLI asli (masih bisa dipakai seperti biasa)
├── requirements.txt
├── data/
│   ├── data_pengeluaran.json  # penyimpanan data (sama seperti versi CLI)
│   └── laporan_pengeluaran.xlsx  # dibuat otomatis saat ekspor
├── function/
│   ├── tambah.py       # buat_catatan() -> logic murni, tambah_catatan() -> versi CLI
│   ├── lihat.py
│   ├── total.py         # hitung_total()
│   ├── statistik.py     # hitung_statistik()
│   ├── cari.py          # cari_nama()
│   ├── ekspor.py        # ekspor_ke_excel()
│   └── hapus.py         # hapus_catatan()
├── templates/
│   └── index.html       # halaman utama (Beranda + 6 fitur)
└── static/
    ├── css/style.css
    └── js/app.js         # panggil API lewat fetch()
```

Setiap file di `function/` sudah dipecah jadi dua bagian:
- fungsi **logic murni** (mis. `buat_catatan`, `hitung_total`, `hitung_statistik`,
  `cari_nama`) — tidak ada `input()`/`print()`, dipakai bersama oleh CLI dan web.
- fungsi **versi CLI asli** (mis. `tambah_catatan`, `total_pengeluaran`) — tetap
  ada dan tetap jalan persis seperti sebelumnya kalau kamu jalankan `main.py`.

## Cara menjalankan

1. Buat virtual environment (opsional tapi disarankan):
   ```bash
   python -m venv venv
   source venv/bin/activate       # Windows: venv\Scripts\activate
   ```

2. Install dependency:
   ```bash
   pip install -r requirements.txt
   ```

3. Jalankan server web:
   ```bash
   python app.py
   ```

4. Buka di browser: **http://127.0.0.1:5000**

CLI lama tetap bisa dipakai kalau perlu:
```bash
python main.py
```

Web dan CLI membaca/menulis file JSON yang sama
(`data/data_pengeluaran.json`), jadi catatan yang ditambah lewat salah satu
akan langsung muncul di yang lain.

## Endpoint API

| Method | Endpoint            | Fungsi                                   |
|--------|----------------------|-------------------------------------------|
| GET    | `/api/pengeluaran`   | Ambil semua catatan (terbaru di atas)     |
| POST   | `/api/pengeluaran`   | Tambah catatan baru — body: `{kategori, nama, nilai}` |
| GET    | `/api/total`         | Total pengeluaran + jumlah catatan        |
| GET    | `/api/statistik`     | Rata-rata, nilai tengah, modus            |
| GET    | `/api/cari?q=...`    | Cari catatan berdasarkan nama             |
| DELETE | `/api/pengeluaran/<idx>` | Hapus satu catatan (mis. salah input) |
| GET    | `/api/ekspor`        | Unduh `laporan_pengeluaran.xlsx`          |

## Fitur Hapus

Fitur baru yang tidak ada di versi CLI asli. Berguna kalau ada pengeluaran
yang salah input dan ingin diulang.

- **Web**: tombol ikon tempat sampah muncul di setiap baris pada halaman
  Lihat dan Cari. Ada konfirmasi sebelum benar-benar terhapus.
- **CLI**: sekarang ada opsi menu **7. Hapus** — menampilkan daftar catatan
  bernomor (terbaru di atas), lalu tinggal ketik nomornya.
- Identifikasi catatan pakai posisi (`idx`) di file `data_pengeluaran.json`,
  jadi tidak mengubah skema data yang sudah ada (tetap 4 kolom:
  `tanggal`, `kategori`, `nama`, `nilai`).

## Catatan perbaikan kecil dari versi asli

- `statistik.py`: ditambahkan pengecekan data kosong, supaya tidak *crash*
  (`StatisticsError`) saat belum ada catatan sama sekali.
- `lihat.py` / `cari.py`: perbaikan quoting f-string supaya kompatibel di
  Python versi lama (di bawah 3.12), tanpa mengubah hasil tampilannya.
- Semua perilaku lain (format kategori Title Case, format waktu, isi kolom
  ekspor) sengaja dipertahankan identik dengan versi CLI aslinya.
