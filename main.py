import json
import os
from function import tambah, lihat, total, statistik, cari, ekspor, hapus

print("\n============================================")
print("             CATATAN PENGELUARAN             ")
print("============================================\n")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Arahkan path masuk ke dalam folder "data" lalu ke nama file-nya
DATA = os.path.join(BASE_DIR, "data", "data_pengeluaran.json")

if os.path.exists(DATA):
    with open(DATA, "r") as file:
        try:
            data_pengeluaran = json.load(file)
        except json.JSONDecodeError:
            data_pengeluaran = []
else:
    data_pengeluaran = []

print("\t1. Tambah\t5. Cari\n\t2. Lihat\t6. Ekspor\n\t3. Total\t7. Hapus\n\t4. Statistik\n")
input_user = input("    Mau Apa Hari Ini? ")

if input_user == "1":
    tambah.tambah_catatan(data_pengeluaran, DATA)

    with open(DATA, "w") as file:
        json.dump(data_pengeluaran, file, indent=4)

elif input_user == "2":
    lihat.lihat_catatan(data_pengeluaran)

elif input_user == "3":
    total.total_pengeluaran(data_pengeluaran)

elif input_user == "4":
    statistik.statistik_pengeluaran(data_pengeluaran)

elif input_user == "5":
    cari.cari_pengeluaran(data_pengeluaran)

elif input_user == "6":
    ekspor.ekspor_ke_excel(data_pengeluaran)

elif input_user == "7":
    hapus.hapus_pengeluaran(data_pengeluaran)

    with open(DATA, "w") as file:
        json.dump(data_pengeluaran, file, indent=4)

else:
    print("\nPilih Salah Satu Fitur")
