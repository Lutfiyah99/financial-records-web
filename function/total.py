def hitung_total(data_pengeluaran):
    """Jumlahkan seluruh nilai pengeluaran. Logika murni, dipakai CLI & web."""
    return sum(item.get("nilai", 0) for item in data_pengeluaran)


def total_pengeluaran(data_pengeluaran):
    print("\n-------- Total Pengeluaran --------")

    total = hitung_total(data_pengeluaran)

    print("\n\tSebesar Rp. {:,},00".format(total))
