from tabulate import tabulate


def urutkan_terbaru(data_pengeluaran):
    """Kembalikan salinan data, terbaru di atas (dipakai web maupun CLI)."""
    return list(reversed(data_pengeluaran))


def lihat_catatan(data_pengeluaran):
    print("\n-------- Lihat Pengeluaran --------")

    if not data_pengeluaran:
        print("\nBelum Ada Catatan Pengeluaran !")
        return

    tabel_data = []

    for item in urutkan_terbaru(data_pengeluaran):
        tabel_data.append([
            item.get("tanggal"),
            item.get("kategori"),
            item.get("nama"),
            "Rp. {:,}".format(item.get("nilai", 0)),
        ])

    header = ["Waktu", "Kategori", "Nama", "Nominal"]

    print("\n" + tabulate(tabel_data, headers=header, tablefmt="fancy_grid"))
