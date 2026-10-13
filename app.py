import json
import os

from flask import Flask, jsonify, request, render_template, send_file

from function import tambah, total, statistik, cari, ekspor, hapus

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "data_pengeluaran.json")

app = Flask(__name__)


# ---------- penyimpanan data (json, sama seperti versi CLI) ----------

def load_data():
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r", encoding="utf-8") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return []
    return []


def save_data(data_pengeluaran):
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w", encoding="utf-8") as file:
        json.dump(data_pengeluaran, file, indent=4, ensure_ascii=False)


def indexed_data():
    """Data mentah dengan 'idx' (posisi asli di file) ditempel di tiap item.

    idx dipakai frontend supaya tahu catatan mana yang mau dihapus, tanpa
    perlu mengubah skema data_pengeluaran.json itu sendiri.
    """
    data = load_data()
    return [{**item, "idx": i} for i, item in enumerate(data)]


# ---------- halaman ----------

@app.route("/")
def index():
    return render_template("index.html")


# ---------- API: tambah & lihat ----------

@app.route("/api/pengeluaran", methods=["GET"])
def api_lihat():
    data = indexed_data()
    # terbaru di atas, tanpa mengubah urutan penyimpanan di file
    return jsonify(list(reversed(data)))


@app.route("/api/pengeluaran", methods=["POST"])
def api_tambah():
    payload = request.get_json(silent=True) or {}

    try:
        catatan = tambah.buat_catatan(
            payload.get("kategori", ""),
            payload.get("nama", ""),
            payload.get("nilai", None),
        )
    except (ValueError, TypeError) as e:
        return jsonify({"error": str(e)}), 400

    data = load_data()
    data.append(catatan)
    save_data(data)

    return jsonify(catatan), 201


@app.route("/api/pengeluaran/<int:idx>", methods=["DELETE"])
def api_hapus(idx):
    data = load_data()

    try:
        dihapus = hapus.hapus_catatan(data, idx)
    except IndexError:
        return jsonify({"error": "Catatan tidak ditemukan"}), 404

    save_data(data)
    return jsonify({"deleted": dihapus}), 200


# ---------- API: total ----------

@app.route("/api/total", methods=["GET"])
def api_total():
    data = load_data()
    return jsonify({
        "total": total.hitung_total(data),
        "jumlah_catatan": len(data),
    })


# ---------- API: statistik ----------

@app.route("/api/statistik", methods=["GET"])
def api_statistik():
    data = load_data()
    hasil = statistik.hitung_statistik(data)

    if hasil is None:
        return jsonify({"error": "Belum ada data untuk dihitung"}), 404

    return jsonify(hasil)


# ---------- API: cari ----------

@app.route("/api/cari", methods=["GET"])
def api_cari():
    kata_kunci = request.args.get("q", "")
    data = indexed_data()
    hasil = cari.cari_nama(data, kata_kunci) if kata_kunci.strip() else []
    return jsonify(hasil)


# ---------- API: ekspor ----------

@app.route("/api/ekspor", methods=["GET"])
def api_ekspor():
    data = load_data()
    file_path = ekspor.ekspor_ke_excel(data)

    if file_path is None:
        return jsonify({"error": "Belum ada data untuk diekspor"}), 400

    return send_file(
        file_path,
        as_attachment=True,
        download_name="laporan_pengeluaran.xlsx",
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
