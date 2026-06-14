// ==== HALAMAN NAVIGASI ====//

/**
 * Tampilkan halaman tertentu ('home' atau 'kalkulator')
 * @param {string} page   - 'home' | 'kalkulator'
 * @param {string} [tab]  - opsional: 'bmi' | 'kalori'
 */
function showPage(page, tab) {
  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active");
    p.classList.add("hidden");
  });
  const target = document.getElementById("page-" + page);
  target.classList.remove("hidden");
  target.classList.add("active");

  document.querySelectorAll(".nav-page-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (tab) activateTab(tab);
}

/**
 * Aktifkan tab kalkulator tertentu
 * @param {string} tabName - 'bmi' | 'kalori'
 */
function activateTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.classList.remove("active");
    b.setAttribute("aria-selected", "false");
  });
  document.querySelectorAll(".tab-panel").forEach((p) => {
    p.classList.remove("active");
    p.classList.add("hidden");
  });
  const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  const panel = document.getElementById("tab-" + tabName);
  if (btn) {
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
  }
  if (panel) {
    panel.classList.remove("hidden");
    panel.classList.add("active");
  }
}

// Pasang event listener navbar
document.querySelectorAll(".nav-page-btn").forEach((btn) => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));
});

// ==== UTILITAS - Validasi ==== //

/**
 * Tampilkan pesan toast di bagian bawah layar
 * @param {string} msg - pesan yang ditampilkan
 * @param {number} dur - durasi dalam ms (default 3000)
 */
function showToast(msg, dur = 3000) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add("hidden"), dur);
}

/**
 * Ambil nilai numerik dari input dan validasi
 * @param {string} id - id elemen input
 * @param {string} label - label untuk pesan error
 * @returns {number|null}
 */
function getNum(id, label) {
  const el = document.getElementById(id);
  const val = parseFloat(el.value);
  if (!el.value.trim() || isNaN(val) || val <= 0) {
    el.classList.add("error");
    setTimeout(() => el.classList.remove("error"), 1800);
    showToast(`${label} harus diisi dengan angka positif.`);
    return null;
  }
  return val;
}

/**
 * Ambil nilai dari select dan validasi
 * @param {string} id - id elemen select
 * @param {string} label - label untuk pesan error
 * @returns {string|null}
 */
function getSelect(id, label) {
  const el = document.getElementById(id);
  if (!el.value) {
    el.classList.add("error");
    setTimeout(() => el.classList.remove("error"), 1800);
    showToast(`${label} harus dipilih.`);
    return null;
  }
  return el.value;
}

/**
 * Reset semua input & sembunyikan hasil pada tab tertentu
 * @param {string} tab - 'bmi' | 'ideal' | 'kalori'
 */
function resetForm(tab) {
  const panel = document.getElementById(`tab-${tab}`);
  // Kosongkan semua input & select
  panel.querySelectorAll("input").forEach((el) => (el.value = ""));
  panel.querySelectorAll("select").forEach((el) => (el.value = ""));
  // Sembunyikan hasil
  const res = document.getElementById(`result-${tab}`);
  if (res) res.classList.add("hidden");
  showToast("Form berhasil direset.");
}

// ==== TAB NAVIGASI ==== //
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    // Update tombol aktif
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    // Update panel aktif
    document.querySelectorAll(".tab-panel").forEach((p) => {
      p.classList.remove("active");
      p.classList.add("hidden");
    });
    const panel = document.getElementById(`tab-${target}`);
    panel.classList.remove("hidden");
    panel.classList.add("active");
  });
});

// ==== KALKULATOR BMI ==== //

/**
 * Dapatkan kategori dan warna berdasarkan nilai BMI
 * @param {number} bmi
 * @returns {{ label: string, color: string, kelas: string }}
 */
function kategoriBMI(bmi) {
  if (bmi < 18.5) return { label: "Kurus", color: "#74b9e0", kelas: "kurus" };
  if (bmi < 25) return { label: "Normal", color: "#4a9e6e", kelas: "normal" };
  if (bmi < 30)
    return { label: "Overweight", color: "#f4a24e", kelas: "overweight" };
  return { label: "Obesitas", color: "#e05f5f", kelas: "obesitas" };
}

/**
 * Konversi nilai BMI menjadi sudut jarum gauge (−90° s/d +90°)
 * BMI 10 → −90° (ujung kiri), BMI 40 → +90° (ujung kanan)
 */
function bmiToAngle(bmi) {
  const clamped = Math.min(40, Math.max(10, bmi));
  return ((clamped - 10) / 30) * 180 - 90; // −90° … +90°
}

/**
 * Hitung dan tampilkan hasil BMI
 */
function hitungBMI() {
  const tinggi = getNum("bmi-tinggi", "Tinggi Badan");
  const berat = getNum("bmi-berat", "Berat Badan");
  if (tinggi === null || berat === null) return;

  // Rumus BMI
  const tinggiM = tinggi / 100;
  const bmi = berat / (tinggiM * tinggiM);
  const bmiRounded = Math.round(bmi * 10) / 10;

  const { label, color, kelas } = kategoriBMI(bmi);

  // Tampilkan nilai
  document.getElementById("bmi-value").textContent = bmiRounded;
  document.getElementById("bmi-value").style.color = color;
  document.getElementById("bmi-label").textContent = label;
  document.getElementById("bmi-label").style.color = color;

  // Animasi jarum gauge
  const angle = bmiToAngle(bmi);
  const needle = document.getElementById("gauge-needle");
  needle.style.transition = "transform 0.7s cubic-bezier(0.4,0,0.2,1)";
  needle.style.transform = `rotate(${angle}deg)`;

  // Animasi arc gauge (stroke-dashoffset)
  const arc = document.getElementById("gauge-arc");
  const total = 251.2; // panjang total busur
  const pct = Math.min(1, (bmi - 10) / 30); // 0 – 1
  const offset = total * (1 - pct);
  arc.style.stroke = color;
  arc.style.transition = "stroke-dashoffset 0.7s ease, stroke 0.3s ease";
  arc.style.strokeDashoffset = offset;

  // Highlight skala aktif
  document
    .querySelectorAll(".scale-item")
    .forEach((el) => el.classList.remove("active-scale"));
  document.querySelector(`.scale-item.${kelas}`).classList.add("active-scale");

  // Catatan teks
  const kgLebih = berat - 24.9 * tinggiM * tinggiM;
  const kgKurang = 18.5 * tinggiM * tinggiM - berat;
  let note = "";
  if (label === "Kurus")
    note = `Kamu perlu menambah berat ±${Math.abs(kgKurang).toFixed(1)} kg untuk mencapai rentang normal.`;
  else if (label === "Normal")
    note = `Selamat! Berat badanmu sudah dalam rentang yang sehat. Pertahankan gaya hidup aktif.`;
  else if (label === "Overweight")
    note = `Kamu perlu menurunkan berat ±${kgLebih.toFixed(1)} kg untuk mencapai rentang normal.`;
  else
    note = `Disarankan berkonsultasi dengan dokter atau ahli gizi untuk program penurunan berat badan yang aman.`;

  document.getElementById("bmi-note").textContent = note;

  // Tampilkan kotak hasil
  const box = document.getElementById("result-bmi");
  box.classList.remove("hidden");
}

// ==== KALKULATOR KALORI HARIAN ==== //

/**
 * Hitung BMR dengan rumus Mifflin-St Jeor lalu
 * kalikan dengan faktor aktivitas (TDEE)
 */
function hitungKalori() {
  const jk = getSelect("kal-jk", "Jenis Kelamin");
  const umur = getNum("kal-umur", "Umur");
  const tinggi = getNum("kal-tinggi", "Tinggi Badan");
  const berat = getNum("kal-berat", "Berat Badan");
  const aktivitas = getSelect("kal-aktivitas", "Tingkat Aktivitas");
  if (!jk || umur === null || tinggi === null || berat === null || !aktivitas)
    return;

  // ---- Mifflin-St Jeor ----
  // Pria:   BMR = 10×berat + 6.25×tinggi − 5×umur + 5
  // Wanita: BMR = 10×berat + 6.25×tinggi − 5×umur − 161
  let bmr;
  if (jk === "pria") {
    bmr = 10 * berat + 6.25 * tinggi - 5 * umur + 5;
  } else {
    bmr = 10 * berat + 6.25 * tinggi - 5 * umur - 161;
  }

  const faktor = parseFloat(aktivitas);
  const tdee = Math.round(bmr * faktor);

  // ---- Tampilkan hasil ----
  document.getElementById("kal-total").textContent =
    tdee.toLocaleString("id-ID");
  document.getElementById("kal-bmr").textContent =
    `${Math.round(bmr).toLocaleString("id-ID")} kkal`;

  // Label faktor aktivitas
  const labelFaktor = {
    1.2: "Sedentary (×1.2)",
    1.375: "Ringan (×1.375)",
    1.55: "Sedang (×1.55)",
    1.725: "Aktif (×1.725)",
    1.9: "Sangat Aktif (×1.9)",
  };
  document.getElementById("kal-faktor").textContent =
    labelFaktor[aktivitas] || aktivitas;

  // Goal kalori
  document.getElementById("kal-turun").textContent =
    `${(tdee - 500).toLocaleString("id-ID")} kkal`;
  document.getElementById("kal-jaga").textContent =
    `${tdee.toLocaleString("id-ID")} kkal`;
  document.getElementById("kal-naik").textContent =
    `${(tdee + 300).toLocaleString("id-ID")} kkal`;

  document.getElementById("result-kalori").classList.remove("hidden");
}

// ==== Enter key - form submit saat enter ==== //
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const active = document.querySelector(".tab-panel.active");
  if (!active) return;
  const id = active.id;
  if (id === "tab-bmi") hitungBMI();
  else if (id === "tab-kalori") hitungKalori();
});
