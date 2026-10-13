import statistics


def hitung_statistik(data_pengeluaran):
    """Hitung rata-rata, nilai tengah, dan modus. Kembalikan None jika data kosong."""
    nilai = [item.get("nilai", 0) for item in data_pengeluaran]

    if not nilai:
        return None

    return {
        "rata_rata": statistics.mean(nilai),
        "nilai_tengah": statistics.median(nilai),
        "modus": statistics.mode(nilai),
    }


def statistik_pengeluaran(data_pengeluaran):
    print("\n-------- Statistik Pengeluaran --------")

    hasil = hitung_statistik(data_pengeluaran)

    if hasil is None:
        print("\nBelum Ada Data Untuk Dihitung!")
        return

    print(
        "\n\tRata-Rata\t: {:,.0f}\n\tNilai Tengah \t: {}\n\tModus     \t: {:,}".format(
            hasil["rata_rata"], hasil["nilai_tengah"], hasil["modus"]
        )
    )
