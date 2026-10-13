from datetime import datetime

KATEGORI_VALID = ("Barang", "Makanan", "Pay")


def buat_catatan(kategori, nama, nilai):
    """Bangun satu catatan pengeluaran yang sudah dinormalisasi.

    Fungsi ini murni logika (tidak ada input()/print()) supaya bisa
    dipakai bersama oleh CLI (main.py) maupun web (app.py).
    """
    kategori = str(kategori).strip().title()
    nama = str(nama).strip().title()
    nilai = int(nilai)

    if kategori not in KATEGORI_VALID:
        raise ValueError(f"Kategori harus salah satu dari: {', '.join(KATEGORI_VALID)}")
    if not nama:
        raise ValueError("Nama tidak boleh kosong")
    if nilai < 0:
        raise ValueError("Nominal tidak boleh negatif")

    return {
        "tanggal": datetime.now().strftime("%H:%M:%S %d-%m-%Y"),
        "kategori": kategori,
        "nama": nama,
        "nilai": nilai,
    }


def tambah_catatan(data_pengeluaran, path_file=None):
    """Versi CLI asli: minta input dari terminal lalu tambahkan ke data_pengeluaran."""
    print("\n-------- Tambah Pengeluaran --------")

    kategori = input("\n\tBarang | Makanan | Pay\n\n   Kategori\t: ")
    nama = input("   Nama\t        : ")
    nilai = input("   Nominal\t: Rp. ")

    catatan = buat_catatan(kategori, nama, nilai)
    data_pengeluaran.append(catatan)
    return catatan
