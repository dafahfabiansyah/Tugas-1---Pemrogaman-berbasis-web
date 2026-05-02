/* =============================================
   SCRIPT.JS - Universitas Terbuka Sistem Bahan Ajar
   ============================================= */

// =============================================
// UTILS
// =============================================
function getStatusBahanAjar(stok) {
  if (stok === 0)          return { label: "Habis",    cls: "badge-red" };
  if (stok < 100)          return { label: "Terbatas", cls: "badge-yellow" };
  return                          { label: "Tersedia", cls: "badge-green" };
}

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function formatTanggal(str) {
  if (!str || str === "-") return "-";
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

// =============================================
// MODAL
// =============================================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}

function closeModalOutside(event, id) {
  if (event.target.id === id) closeModal(id);
}

// =============================================
// LOGIN PAGE
// =============================================
(function initLogin() {
  const form = document.getElementById("formLogin");
  if (!form) return;

  // Toggle password visibility
  const toggleBtn = document.getElementById("togglePass");
  const passInput = document.getElementById("password");
  if (toggleBtn && passInput) {
    toggleBtn.addEventListener("click", function () {
      const isPassword = passInput.type === "password";
      passInput.type = isPassword ? "text" : "password";
      toggleBtn.innerHTML = isPassword ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const email    = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    const user = dataPengguna.find(
      (u) => u.email.toLowerCase() === email && u.password === password
    );

    if (user) {
      sessionStorage.setItem("loggedUser", JSON.stringify(user));
      window.location.href = "dashboard.html";
    } else {
      alert("email/password yang anda masukkan salah");
    }
  });
})();

function kirimReset() {
  const email = document.getElementById("emailReset").value.trim();
  if (!email) { alert("Masukkan email terlebih dahulu."); return; }
  alert("Instruksi reset password telah dikirim ke: " + email);
  closeModal("modalLupaPassword");
  document.getElementById("emailReset").value = "";
}

function daftarAkun() {
  const nama      = document.getElementById("regNama").value.trim();
  const email     = document.getElementById("regEmail").value.trim();
  const unit      = document.getElementById("regUnit").value.trim();
  const pass      = document.getElementById("regPassword").value;
  const konfirm   = document.getElementById("regKonfirmasi").value;

  if (!nama || !email || !unit || !pass) {
    alert("Semua field harus diisi."); return;
  }
  if (pass !== konfirm) {
    alert("Konfirmasi password tidak cocok."); return;
  }

  alert("Pendaftaran berhasil! Akun Anda sedang diverifikasi oleh admin.");
  closeModal("modalDaftar");
}

// =============================================
// GREETING & TOPBAR (Dashboard & all pages)
// =============================================
function initGreeting() {
  const greetingEl = document.getElementById("greetingText");
  const userEl     = document.getElementById("greetingUser");
  const dateEl     = document.getElementById("greetingDate");
  const topbarUser = document.getElementById("topbarUser");

  const user = JSON.parse(sessionStorage.getItem("loggedUser") || "null");
  const nama = user ? user.nama : "Operator UT Daerah";

  const now  = new Date();
  const jam  = now.getHours();
  let salam  = "Selamat Datang";
  if (jam >= 5  && jam < 12) salam = "Selamat Pagi";
  else if (jam >= 12 && jam < 15) salam = "Selamat Siang";
  else if (jam >= 15 && jam < 19) salam = "Selamat Sore";
  else salam = "Selamat Malam";

  if (greetingEl) greetingEl.textContent = salam + ", " + nama + "!";
  if (userEl)     userEl.textContent     = nama;
  if (topbarUser) topbarUser.textContent = nama;
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  }
}

function initTopbarUser() {
  const topbarUser = document.getElementById("topbarUser");
  if (!topbarUser) return;
  const user = JSON.parse(sessionStorage.getItem("loggedUser") || "null");
  if (user) topbarUser.textContent = user.nama;
}

// =============================================
// SIDEBAR TOGGLE
// =============================================
function toggleSidebar() {
  const sidebar  = document.getElementById("sidebar");
  const content  = document.querySelector(".main-content");
  const topbar   = document.querySelector(".topbar");

  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("open");
  } else {
    sidebar.classList.toggle("collapsed");
    if (sidebar.classList.contains("collapsed")) {
      content.style.marginLeft = "60px";
      topbar.style.left        = "60px";
    } else {
      content.style.marginLeft = "";
      topbar.style.left        = "";
    }
  }
}

function toggleSubMenu(event, menuId) {
  event.preventDefault();
  const sub   = document.getElementById(menuId);
  const arrow = document.getElementById("arrowLaporan");
  if (!sub) return;
  sub.classList.toggle("open");
  if (arrow) arrow.style.transform = sub.classList.contains("open") ? "rotate(180deg)" : "";
}

// =============================================
// LOGOUT
// =============================================
function logout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    sessionStorage.removeItem("loggedUser");
    window.location.href = "index.html";
  }
}

// =============================================
// DASHBOARD — LAPORAN & HISTORI
// =============================================
function showLaporan(tipe) {
  const panel   = document.getElementById("panelLaporan");
  const title   = document.getElementById("panelLaporanTitle");
  const content = document.getElementById("panelLaporanContent");
  if (!panel) return;

  tutupPanel("panelHistori");
  panel.style.display = "block";

  if (tipe === "progress") {
    title.textContent = "Monitoring Progress DO Bahan Ajar";
    let html = `<table class="laporan-table">
      <thead><tr>
        <th>No DO</th><th>Nama Mahasiswa</th><th>Ekspedisi</th>
        <th>Tgl Kirim</th><th>Status</th>
      </tr></thead><tbody>`;
    Object.values(dataTracking).forEach((d) => {
      const badgeClass = d.status === "Dikirim" ? "badge-green" : "badge-yellow";
      html += `<tr>
        <td>${d.nomorDO}</td>
        <td>${d.nama}</td>
        <td>${d.ekspedisi}</td>
        <td>${formatTanggal(d.tanggalKirim)}</td>
        <td><span class="badge ${badgeClass}">${d.status}</span></td>
      </tr>`;
    });
    html += "</tbody></table>";
    content.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } else {
    title.textContent = "Rekap Bahan Ajar";
    const tersedia = dataBahanAjar.filter(d => d.stok >= 100).length;
    const terbatas = dataBahanAjar.filter(d => d.stok > 0 && d.stok < 100).length;
    const habis    = dataBahanAjar.filter(d => d.stok === 0).length;

    let html = `<div class="stats-grid" style="margin-bottom:16px;">
      <div class="stat-card blue"><div class="stat-icon"><i data-lucide="book-open"></i></div>
        <div class="stat-info"><span class="stat-number">${dataBahanAjar.length}</span><span class="stat-label">Total Judul</span></div></div>
      <div class="stat-card yellow"><div class="stat-icon"><i data-lucide="check-circle"></i></div>
        <div class="stat-info"><span class="stat-number">${tersedia}</span><span class="stat-label">Tersedia</span></div></div>
      <div class="stat-card white-border"><div class="stat-icon"><i data-lucide="alert-triangle"></i></div>
        <div class="stat-info"><span class="stat-number">${terbatas}</span><span class="stat-label">Terbatas</span></div></div>
      <div class="stat-card blue"><div class="stat-icon"><i data-lucide="x-circle"></i></div>
        <div class="stat-info"><span class="stat-number">${habis}</span><span class="stat-label">Habis</span></div></div>
    </div>`;

    html += `<table class="laporan-table"><thead><tr>
      <th>Kode Barang</th><th>Nama Bahan Ajar</th><th>Jenis</th><th>Edisi</th><th>Stok</th><th>Status</th>
    </tr></thead><tbody>`;
    dataBahanAjar.forEach(d => {
      const s = getStatusBahanAjar(d.stok);
      html += `<tr>
        <td>${d.kodeBarang}</td><td>${d.namaBarang}</td><td>${d.jenisBarang}</td>
        <td>${d.edisi}</td><td>${d.stok}</td>
        <td><span class="badge ${s.cls}">${s.label}</span></td>
      </tr>`;
    });
    html += "</tbody></table>";
    content.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  panel.scrollIntoView({ behavior: "smooth" });
}

function showHistori() {
  const panel   = document.getElementById("panelHistori");
  const content = document.getElementById("panelHistoriContent");
  if (!panel) return;

  tutupPanel("panelLaporan");
  panel.style.display = "block";

  let html = `<table class="laporan-table"><thead><tr>
    <th>No DO</th><th>Nama</th><th>Kode Paket</th>
    <th>Ekspedisi</th><th>Tgl Kirim</th><th>Total</th><th>Status</th>
  </tr></thead><tbody>`;

  Object.values(dataTracking).forEach(d => {
    const bc = d.status === "Dikirim" ? "badge-green" : "badge-yellow";
    html += `<tr>
      <td>${d.nomorDO}</td>
      <td>${d.nama}</td>
      <td>${d.paket}</td>
      <td>${d.ekspedisi}</td>
      <td>${formatTanggal(d.tanggalKirim)}</td>
      <td>${d.total}</td>
      <td><span class="badge ${bc}">${d.status}</span></td>
    </tr>`;
  });

  html += "</tbody></table>";
  content.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
  panel.scrollIntoView({ behavior: "smooth" });
}

function tutupPanel(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

// =============================================
// TRACKING PAGE
// =============================================
function cariTracking() {
  const input = document.getElementById("inputNoDO").value.trim();
  const hasil = document.getElementById("hasilTracking");
  const tidakDitemukan = document.getElementById("tidakDitemukan");

  const data = dataTracking[input];

  if (!data) {
    hasil.style.display = "none";
    tidakDitemukan.style.display = "block";
    return;
  }

  tidakDitemukan.style.display = "none";

  // Isi informasi
  document.getElementById("trNoDO").textContent         = data.nomorDO;
  document.getElementById("trNama").textContent         = data.nama;
  document.getElementById("trNIM").textContent          = data.paket;
  document.getElementById("trAlamat").textContent       = data.ekspedisi;
  document.getElementById("trEkspedisi").textContent    = data.ekspedisi;
  document.getElementById("trTanggalKirim").textContent = formatTanggal(data.tanggalKirim);
  document.getElementById("trJenisPaket").textContent   = data.paket;
  document.getElementById("trTotal").textContent        = data.total;

  // Status badge
  const badge = document.getElementById("trStatusBadge");
  badge.textContent = data.status;
  badge.className = "status-badge";
  const mapClass = {
    "Dikirim":           "terkirim",
    "Dalam Perjalanan":  "dikirim",
    "Dikemas":           "dikemas",
    "Dikonfirmasi":      "dikonfirmasi",
  };
  badge.classList.add(mapClass[data.status] || "dikirim");

  // Progress steps (derive step number from status)
  const statusStepMap = {
    "Dikonfirmasi":     1,
    "Dikemas":          2,
    "Dalam Perjalanan": 3,
    "Dikirim":          4,
  };
  const currentStep = statusStepMap[data.status] || 3;

  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById("step" + i);
    stepEl.classList.remove("done", "active");
    if (i < currentStep)       stepEl.classList.add("done");
    else if (i === currentStep) stepEl.classList.add("active");
  }
  for (let i = 1; i <= 3; i++) {
    const lineEl = document.getElementById("line" + i);
    lineEl.classList.remove("done");
    if (i < currentStep) lineEl.classList.add("done");
  }

  // Timeline perjalanan
  const timeline = document.getElementById("timelineRiwayat");
  let tlHtml = "";
  data.perjalanan.forEach(r => {
    tlHtml += `<div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="tl-status">${r.keterangan}</div>
        <div class="tl-tanggal">${r.waktu}</div>
      </div>
    </div>`;
  });
  timeline.innerHTML = tlHtml;

  hasil.style.display = "block";
  hasil.scrollIntoView({ behavior: "smooth" });
}

function resetTracking() {
  document.getElementById("inputNoDO").value = "";
  document.getElementById("hasilTracking").style.display = "none";
  document.getElementById("tidakDitemukan").style.display = "none";
}

// Enter key untuk pencarian
document.addEventListener("DOMContentLoaded", function () {
  const inputDO = document.getElementById("inputNoDO");
  if (inputDO) {
    inputDO.addEventListener("keydown", function (e) {
      if (e.key === "Enter") cariTracking();
    });
  }
});

// =============================================
// STOK PAGE
// =============================================
let stokData   = [];
let hapusIndex = null;

function initStok() {
  const tbody = document.getElementById("tbodyStok");
  if (!tbody) return;

  // Salin data dummy ke array lokal
  stokData = dataBahanAjar.map(d => ({ ...d }));
  renderTabelStok(stokData);
}

function renderTabelStok(data) {
  const tbody = document.getElementById("tbodyStok");
  const totalEl = document.getElementById("totalData");
  if (!tbody) return;

  if (totalEl) totalEl.textContent = data.length + " data ditemukan";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#757575;padding:24px;">Tidak ada data</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((item, idx) => {
    const realIdx = stokData.indexOf(item);
    const s = getStatusBahanAjar(item.stok);
    return `<tr>
      <td>${idx + 1}</td>
      <td>${item.kodeLokasi}</td>
      <td><strong>${item.kodeBarang}</strong></td>
      <td>${item.namaBarang}</td>
      <td>${item.jenisBarang}</td>
      <td>${item.edisi}</td>
      <td>${item.stok}</td>
      <td><span class="badge ${s.cls}">${s.label}</span></td>
      <td>
        <button class="action-btn delete" title="Hapus" onclick="konfirmasiHapus(${realIdx})"><i data-lucide="trash-2"></i></button>
      </td>
    </tr>`;
  }).join("");
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function filterStok() {
  const cari   = (document.getElementById("inputCariStok")?.value || "").toLowerCase();
  const status = document.getElementById("filterStatus")?.value || "";

  const filtered = stokData.filter(item => {
    const matchCari   = item.kodeBarang.toLowerCase().includes(cari) || item.namaBarang.toLowerCase().includes(cari);
    const matchStatus = !status || getStatusBahanAjar(item.stok).label === status;
    return matchCari && matchStatus;
  });

  renderTabelStok(filtered);
}

function tambahBahanAjar() {
  const kodeLokasi  = document.getElementById("inputKodeLokasi").value.trim().toUpperCase();
  const kodeBarang  = document.getElementById("inputKodeBarang").value.trim().toUpperCase();
  const namaBarang  = document.getElementById("inputNamaBarang").value.trim();
  const jenisBarang = document.getElementById("inputJenisBarang").value.trim() || "BMP";
  const edisi       = document.getElementById("inputEdisi").value.trim() || "1";
  const stok        = parseInt(document.getElementById("inputStok").value) || 0;

  if (!kodeLokasi || !kodeBarang || !namaBarang) {
    alert("Kode Lokasi, Kode Barang, dan Nama Barang harus diisi."); return;
  }

  const duplikat = stokData.find(d => d.kodeBarang === kodeBarang);
  if (duplikat) {
    alert("Kode Barang " + kodeBarang + " sudah ada dalam data."); return;
  }

  stokData.push({ kodeLokasi, kodeBarang, namaBarang, jenisBarang, edisi, stok, cover: "" });
  resetFormTambah();
  filterStok();
}

function resetFormTambah() {
  ["inputKodeLokasi","inputKodeBarang","inputNamaBarang","inputJenisBarang","inputEdisi","inputStok"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

function konfirmasiHapus(index) {
  hapusIndex = index;
  openModal("modalHapus");
  document.getElementById("btnKonfirmasiHapus").onclick = function () {
    stokData.splice(hapusIndex, 1);
    closeModal("modalHapus");
    filterStok();
  };
}

// =============================================
// INIT — jalankan fungsi sesuai halaman
// =============================================
document.addEventListener("DOMContentLoaded", function () {
  initGreeting();
  initTopbarUser();
  initStok();
  if (typeof lucide !== 'undefined') lucide.createIcons();
});
