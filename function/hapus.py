from tabulate import tabulate


def hapus_catatan(data_pengeluaran, idx):
    """Hapus satu catatan berdasarkan posisi index-nya di list penyimpanan asli.

    Mengembalikan catatan yang dihapus. Logika murni (tidak ada input()/print()),
    dipakai bersama oleh CLI dan web -- sama seperti fungsi lain di folder ini.
    """
    if not isinstance(idx, int) or idx < 0 or idx >= len(data_pengeluaran):
        raise IndexError("Index catatan tidak valid")
    return data_pengeluaran.pop(idx)


def hapus_pengeluaran(data_pengeluaran):
    """Versi CLI: tampilkan daftar bernomor (terbaru di atas), lalu hapus nomor pilihan."""
    print("\n-------- Hapus Pengeluaran --------")

    if not data_pengeluaran:
        print("\nBelum Ada Catatan Pengeluaran !")
        return

    urutan_tampil = list(reversed(data_pengeluaran))
    tabel_data = []
    for nomor, item in enumerate(urutan_tampil, start=1):
        tabel_data.append([
            nomor,
            item.get("tanggal"),
            item.get("kategori"),
            item.get("nama"),
            "Rp. {:,}".format(item.get("nilai", 0)),
        ])
    header = ["No", "Waktu", "Kategori", "Nama", "Nominal"]
    print("\n" + tabulate(tabel_data, headers=header, tablefmt="fancy_grid"))

    pilihan = input("\nHapus catatan nomor berapa? (kosongkan untuk batal) : ")
    if not pilihan.strip():
        print("\nDibatalkan.")
        return

    try:
        nomor = int(pilihan)
        if nomor < 1 or nomor > len(urutan_tampil):
            raise ValueError
    except ValueError:
        print("\nNomor tidak valid!")
        return

    # nomor yang ditampilkan urut dari terbaru, sedangkan penyimpanan aslinya
    # urut dari yang paling lama -- jadi perlu dipetakan balik ke index asli.
    idx_asli = len(data_pengeluaran) - nomor
    dihapus = hapus_catatan(data_pengeluaran, idx_asli)
    print("\nCatatan '{}' seharga Rp. {:,} berhasil dihapus.".format(
        dihapus.get("nama"), dihapus.get("nilai", 0)
    ))
