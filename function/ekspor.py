import os
import pandas as pd

DIRECTORY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(DIRECTORY, "data", "data_pengeluaran.json")


def path_laporan():
    return os.path.join(DIRECTORY, "data", "laporan_pengeluaran.xlsx")


def ekspor_ke_excel(data_pengeluaran):
    print("\n-------- Ekspor Laporan Pengeluaran --------")

    if not data_pengeluaran:
        print("\nBelum Ada Data Untuk Diekspor!")
        return None

    try:
        df = pd.DataFrame(data_pengeluaran)

        file_path = path_laporan()
        df.to_excel(file_path, index=False, sheet_name="Pengeluaran")

        print(f"\n\t    Berhasil Mengekspor!\n  File Disimpan di {file_path}")
        return file_path

    except Exception as e:
        print(f"\nGagal Mengekspor! Terjadi Kesalahan Saat Proses Ekspor! {e}")
        return None
