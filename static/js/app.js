(function(){
  "use strict";

  var CATEGORIES = ["Barang", "Makanan", "Pay"];
  var state = { selectedKategori: null };

  // ---------- helpers ----------
  function formatRupiah(n){
    n = Number(n) || 0;
    return "Rp" + n.toLocaleString("id-ID");
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function tagHtml(kategori){
    var k = CATEGORIES.indexOf(kategori) >= 0 ? kategori : "Barang";
    return '<span class="tag tag-'+k+'"><span class="tag-dot"></span>'+k+'</span>';
  }
  function emptyHtml(title, desc){
    return '<div class="card empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5"/></svg>'+
      '<div class="t">'+escapeHtml(title)+'</div><div class="d">'+escapeHtml(desc)+'</div></div>';
  }
  var trashIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M10 11v6M14 11v6"/></svg>';

  function tableHtml(rows){
    var body = rows.map(function(item){
      return "<tr>"+
        '<td class="when">'+escapeHtml(item.tanggal||"")+"</td>"+
        "<td>"+tagHtml(item.kategori)+"</td>"+
        "<td>"+escapeHtml(item.nama||"")+"</td>"+
        '<td class="amt num">'+formatRupiah(item.nilai)+"</td>"+
        '<td class="act"><button type="button" class="btn-del" data-idx="'+item.idx+'" data-nama="'+escapeHtml(item.nama||"")+'" title="Hapus catatan" aria-label="Hapus catatan">'+trashIcon+'</button></td>'+
      "</tr>";
    }).join("");
    return '<div class="table-wrap"><table><thead><tr>'+
      "<th>Waktu</th><th>Kategori</th><th>Nama</th><th class=\"amt\">Nominal</th><th class=\"act\"></th>"+
      "</tr></thead><tbody>"+body+"</tbody></table></div>";
  }

  // ---------- tiny fetch wrappers ----------
  function apiGet(url){
    return fetch(url).then(function(res){
      return res.json().then(function(body){
        if(!res.ok) throw new Error((body && body.error) || "Gagal memuat data");
        return body;
      });
    });
  }
  function apiPost(url, data){
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function(res){
      return res.json().then(function(body){
        if(!res.ok) throw new Error((body && body.error) || "Gagal menyimpan data");
        return body;
      });
    });
  }
  function apiDelete(url){
    return fetch(url, { method: "DELETE" }).then(function(res){
      return res.json().then(function(body){
        if(!res.ok) throw new Error((body && body.error) || "Gagal menghapus data");
        return body;
      });
    });
  }

  // ---------- hapus (delegated: tombolnya muncul di tabel Lihat & Cari) ----------
  document.addEventListener("click", function(e){
    var btn = e.target.closest(".btn-del");
    if(!btn) return;

    var idx = btn.getAttribute("data-idx");
    var nama = btn.getAttribute("data-nama");

    if(!window.confirm('Hapus catatan "'+nama+'"? Tindakan ini tidak bisa dibatalkan.')) return;

    btn.disabled = true;
    apiDelete("/api/pengeluaran/" + idx).then(function(){
      showToast("Catatan dihapus");
      renderLihat();
      if(cariInput.value.trim()) renderCari();
    }).catch(function(err){
      btn.disabled = false;
      showToast(err.message || "Gagal menghapus catatan");
    });
  });

  // ---------- navigation ----------
  var pages = ["home","tambah","lihat","total","statistik","cari","ekspor"];
  function goTo(page){
    if(pages.indexOf(page) === -1) page = "home";
    pages.forEach(function(p){
      var el = document.getElementById("page-"+p);
      if(el) el.classList.toggle("active", p === page);
    });
    document.querySelectorAll(".navbtn[data-page]").forEach(function(b){
      b.classList.toggle("active", b.getAttribute("data-page") === page);
    });
    document.querySelectorAll(".tabbtn[data-page]").forEach(function(b){
      b.classList.toggle("active", b.getAttribute("data-page") === page);
    });
    window.scrollTo(0, 0);

    if(page === "home") renderHome();
    if(page === "lihat") renderLihat();
    if(page === "total") renderTotal();
    if(page === "statistik") renderStatistik();
    if(page === "cari") renderCari();
    if(page === "ekspor") renderEkspor();
  }
  document.querySelectorAll("[data-page]").forEach(function(el){
    el.addEventListener("click", function(){ goTo(el.getAttribute("data-page")); });
  });

  // ---------- toast ----------
  var toastTimer = null;
  function showToast(msg){
    var t = document.getElementById("toast");
    document.getElementById("toastMsg").textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove("show"); }, 2600);
  }

  // ---------- HOME ----------
  function renderHome(){
    Promise.all([ apiGet("/api/total"), apiGet("/api/pengeluaran") ]).then(function(results){
      var totalInfo = results[0], data = results[1]; // data already newest-first from backend

      document.getElementById("heroTotal").textContent = formatRupiah(totalInfo.total);
      document.getElementById("heroMeta").textContent = totalInfo.jumlah_catatan + " catatan";

      var breakdown = {};
      CATEGORIES.forEach(function(c){ breakdown[c] = 0; });
      data.forEach(function(i){
        var k = CATEGORIES.indexOf(i.kategori) >= 0 ? i.kategori : "Barang";
        breakdown[k] += Number(i.nilai) || 0;
      });

      var bd = document.getElementById("catBreakdown");
      bd.innerHTML = "";
      CATEGORIES.forEach(function(cat){
        var amt = breakdown[cat];
        var pct = totalInfo.total > 0 ? Math.round((amt/totalInfo.total)*100) : 0;
        var row = document.createElement("div");
        row.className = "cat-row";
        row.innerHTML = tagHtml(cat) +
          '<div class="bar-track"><div class="bar-fill" style="width:'+pct+'%; background:var(--paper-raised);"></div></div>' +
          '<div class="amt num" style="color:rgba(255,255,255,0.9);">'+formatRupiah(amt)+'</div>';
        bd.appendChild(row);
      });

      var mini = document.getElementById("txMini");
      var recent = data.slice(0,5);
      if(recent.length === 0){
        mini.innerHTML = '<div class="empty" style="padding:28px 10px;"><div class="t">Belum ada catatan</div><div class="d">Mulai dari menu Tambah</div></div>';
      }else{
        mini.innerHTML = recent.map(function(item){
          return '<div class="tx-mini-row">' + tagHtml(item.kategori) +
            '<span class="name">'+escapeHtml(item.nama)+'</span>' +
            '<span class="when">'+escapeHtml((item.tanggal||"").split(" ")[0]||"")+'</span>' +
            '<span class="amt num">'+formatRupiah(item.nilai)+'</span></div>';
        }).join("");
      }
    }).catch(function(e){
      showToast(e.message || "Gagal memuat data");
    });
  }

  // ---------- TAMBAH ----------
  document.querySelectorAll(".chip").forEach(function(chip){
    chip.addEventListener("click", function(){
      var k = chip.getAttribute("data-kategori");
      state.selectedKategori = k;
      document.querySelectorAll(".chip").forEach(function(c){
        c.classList.remove("sel-Barang","sel-Makanan","sel-Pay");
      });
      chip.classList.add("sel-"+k);
    });
  });

  document.getElementById("btnSimpan").addEventListener("click", function(){
    var err = document.getElementById("formErr");
    var btn = document.getElementById("btnSimpan");
    var namaRaw = document.getElementById("inpNama").value;
    var nilaiRaw = document.getElementById("inpNilai").value;
    err.classList.remove("show");

    if(!state.selectedKategori){ err.textContent = "Pilih kategori dulu ya."; err.classList.add("show"); return; }
    if(!namaRaw.trim()){ err.textContent = "Nama pengeluaran belum diisi."; err.classList.add("show"); return; }
    var nilai = parseInt(nilaiRaw, 10);
    if(!nilaiRaw || isNaN(nilai) || nilai < 0){ err.textContent = "Nominal harus berupa angka."; err.classList.add("show"); return; }

    btn.disabled = true;
    apiPost("/api/pengeluaran", { kategori: state.selectedKategori, nama: namaRaw, nilai: nilai })
      .then(function(){
        document.getElementById("inpNama").value = "";
        document.getElementById("inpNilai").value = "";
        document.querySelectorAll(".chip").forEach(function(c){ c.classList.remove("sel-Barang","sel-Makanan","sel-Pay"); });
        state.selectedKategori = null;
        btn.disabled = false;
        showToast("Catatan tersimpan");
      })
      .catch(function(e){
        btn.disabled = false;
        err.textContent = e.message || "Gagal menyimpan catatan.";
        err.classList.add("show");
      });
  });

  // ---------- LIHAT ----------
  function renderLihat(){
    var content = document.getElementById("lihatContent");
    content.innerHTML = '<div class="card" style="text-align:center; color:var(--ink-faint);">Memuat…</div>';
    apiGet("/api/pengeluaran").then(function(data){
      document.getElementById("lihatDesc").textContent = data.length + " catatan, diurutkan dari yang terbaru.";
      content.innerHTML = data.length === 0
        ? emptyHtml("Belum ada catatan pengeluaran", "Tambahkan catatan pertamamu lewat menu Tambah.")
        : tableHtml(data);
    }).catch(function(e){
      content.innerHTML = emptyHtml("Gagal memuat data", e.message || "Coba muat ulang halaman.");
    });
  }

  // ---------- TOTAL ----------
  function renderTotal(){
    Promise.all([ apiGet("/api/total"), apiGet("/api/pengeluaran") ]).then(function(results){
      var totalInfo = results[0], data = results[1];
      document.getElementById("totalBig").textContent = formatRupiah(totalInfo.total);
      document.getElementById("totalMeta").textContent = "dari " + totalInfo.jumlah_catatan + " catatan";

      var breakdown = {};
      CATEGORIES.forEach(function(c){ breakdown[c] = 0; });
      data.forEach(function(i){
        var k = CATEGORIES.indexOf(i.kategori) >= 0 ? i.kategori : "Barang";
        breakdown[k] += Number(i.nilai) || 0;
      });

      var bd = document.getElementById("totalBreakdown");
      bd.innerHTML = "";
      CATEGORIES.forEach(function(cat){
        var amt = breakdown[cat];
        var pct = totalInfo.total > 0 ? Math.round((amt/totalInfo.total)*100) : 0;
        var row = document.createElement("div");
        row.className = "cat-row";
        row.innerHTML = tagHtml(cat) +
          '<div class="bar-track"><div class="bar-fill" style="width:'+pct+'%; background:var(--primary);"></div></div>' +
          '<div class="amt num">'+formatRupiah(amt)+' · '+pct+'%</div>';
        bd.appendChild(row);
      });
    }).catch(function(e){
      showToast(e.message || "Gagal memuat total");
    });
  }

  // ---------- STATISTIK ----------
  function renderStatistik(){
    var el = document.getElementById("statContent");
    el.innerHTML = '<div class="card" style="text-align:center; color:var(--ink-faint);">Memuat…</div>';

    Promise.all([
      apiGet("/api/statistik").catch(function(){ return null; }),
      apiGet("/api/pengeluaran")
    ]).then(function(results){
      var stats = results[0], data = results[1];

      if(!stats){
        el.innerHTML = emptyHtml("Belum cukup data", "Statistik butuh minimal satu catatan pengeluaran.");
        return;
      }

      var vals = data.map(function(i){ return Number(i.nilai) || 0; });
      var maxV = Math.max.apply(null, vals);
      var bars = data.slice(0,20).slice().reverse().map(function(i){
        var h = maxV > 0 ? Math.max(4, Math.round((i.nilai/maxV)*100)) : 4;
        return '<div class="bar" style="height:'+h+'%;" title="'+escapeHtml(i.nama)+' — '+formatRupiah(i.nilai)+'"></div>';
      }).join("");

      el.innerHTML =
        '<div class="stat-grid">' +
          '<div class="stat-card"><div class="label">Rata-rata</div><div class="value">'+formatRupiah(Math.round(stats.rata_rata))+'</div><div class="sub">total ÷ jumlah catatan</div></div>' +
          '<div class="stat-card"><div class="label">Nilai tengah</div><div class="value">'+formatRupiah(stats.nilai_tengah)+'</div><div class="sub">median dari semua nominal</div></div>' +
          '<div class="stat-card"><div class="label">Modus</div><div class="value">'+formatRupiah(stats.modus)+'</div><div class="sub">nominal paling sering muncul</div></div>' +
        '</div>' +
        '<div class="card section-gap">' +
          '<div class="row-between"><h2 style="font-size:14px;">Sebaran nominal</h2><span class="hint">'+Math.min(20,data.length)+' catatan terakhir</span></div>' +
          '<div class="hist">'+bars+'</div>' +
        '</div>';
    }).catch(function(e){
      el.innerHTML = emptyHtml("Gagal memuat statistik", e.message || "Coba muat ulang halaman.");
    });
  }

  // ---------- CARI ----------
  var cariInput = document.getElementById("inpCari");
  var cariDebounce = null;
  function renderCari(){
    var q = cariInput.value.trim();
    var el = document.getElementById("cariContent");
    if(!q){
      el.innerHTML = '<div class="card empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg><div class="t">Mulai ketik nama</div><div class="d">Hasil pencarian akan tampil di sini.</div></div>';
      return;
    }
    apiGet("/api/cari?q=" + encodeURIComponent(q)).then(function(results){
      el.innerHTML = results.length === 0
        ? emptyHtml("Data tidak ditemukan", "Coba kata kunci lain, mungkin ada salah ketik.")
        : tableHtml(results);
    }).catch(function(e){
      el.innerHTML = emptyHtml("Gagal mencari", e.message || "Coba lagi sesaat lagi.");
    });
  }
  cariInput.addEventListener("input", function(){
    clearTimeout(cariDebounce);
    cariDebounce = setTimeout(renderCari, 180);
  });

  // ---------- EKSPOR ----------
  function renderEkspor(){
    apiGet("/api/total").then(function(info){
      document.getElementById("ekspCount").textContent = info.jumlah_catatan;
    }).catch(function(){ /* diam saja, tombol tetap bisa dicoba */ });
  }

  document.getElementById("btnEkspor").addEventListener("click", function(){
    var status = document.getElementById("ekspStatus");
    var btn = document.getElementById("btnEkspor");
    status.className = "export-status show";
    status.textContent = "Menyiapkan berkas…";
    btn.disabled = true;

    fetch("/api/ekspor").then(function(res){
      if(!res.ok){
        return res.json().then(function(body){
          throw new Error((body && body.error) || "Gagal mengekspor");
        });
      }
      return res.blob();
    }).then(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "laporan_pengeluaran.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      status.className = "export-status show ok";
      status.textContent = "Berhasil mengekspor.";
      btn.disabled = false;
    }).catch(function(e){
      status.className = "export-status show err";
      status.textContent = e.message || "Gagal mengekspor. Terjadi kesalahan saat proses ekspor.";
      btn.disabled = false;
    });
  });

  // ---------- init ----------
  goTo("home");
})();
