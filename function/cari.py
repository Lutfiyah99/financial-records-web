from tabulate import tabulate


def cari_nama(data_pengeluaran, kata_kunci):
    """Cari catatan yang namanya mengandung kata_kunci (tidak peka huruf besar/kecil)."""
    kata_kunci = str(kata_kunci).strip().title()

    if not kata_kunci:
        return []

    return [
        item for item in reversed(data_pengeluaran)
        if kata_kunci in item.get("nama", "").title()
    ]


def cari_pengeluaran(data_pengeluaran):
    print("\n-------- Cari Pengeluaran --------")

    input_cari = input("\nMasukkan Nama Pengeluaran : ")
    data_cari = cari_nama(data_pengeluaran, input_cari)

    if data_cari:
        tabel_data = [
            [d.get("tanggal", "-"), d.get("kategori", "-"), d.get("nama", "-"), "Rp {:,}".format(d.get("nilai", 0))]
            for d in data_cari
        ]
        header = ["Waktu", "Kategori", "Nama", "Nominal"]
        print("\n" + tabulate(tabel_data, headers=header, tablefmt="fancy_grid"))
    else:
        print("\nData Tidak Ditemukan!")
