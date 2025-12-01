// app.js

// Small helper to avoid errors if something missing
function $(id) {
  return document.getElementById(id);
}

// Elements
const openSurahListBtn = $("openSurahListBtn");
const surahSheet = $("surahSheet");
const closeSurahSheetBtn = $("closeSurahSheetBtn");
const surahListContainer = $("surahListContainer");
const surahSearchInput = $("surahSearchInput");
const surahSearchClearBtn = $("surahSearchClearBtn");
const lastReadLabel = $("lastReadLabel");
const continueTitle = $("continueTitle");
const continueSub = $("continueSub");
const continueBtn = $("continueBtn");
const settingsBtn = $("settingsBtn");

// LocalStorage keys
const LAST_SURA_KEY = "qwb_last_surah";

// ---------- State helpers ----------

function loadLastSurah() {
  try {
    const raw = localStorage.getItem(LAST_SURA_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error parsing last surah", e);
    return null;
  }
}

function saveLastSurah(sura) {
  try {
    localStorage.setItem(LAST_SURA_KEY, JSON.stringify(sura));
  } catch (e) {
    console.error("Error saving last surah", e);
  }
}

function updateLastReadUI() {
  const last = loadLastSurah();
  if (!last) {
    lastReadLabel.textContent = "নির্বাচিত নেই";
    continueTitle.textContent = "কোন সূরা নির্বাচিত নেই";
    continueSub.textContent = "সবচেয়ে শেষ যেখান থেকে পড়েছেন, সেখান থেকেই শুরু হবে";
    return;
  }

  const label = `${last.number}. ${last.nameBn}`;
  lastReadLabel.textContent = label;
  continueTitle.textContent = label;
  continueSub.textContent = `আয়াত ${last.ayah || 1} থেকে চালু করুন`;
}

// ---------- Surah list rendering ----------

function renderSurahList(filterText = "") {
  if (!window.suras || !Array.isArray(window.suras)) {
    surahListContainer.innerHTML = "<div style='padding:8px;font-size:13px;color:#f87171;'>suras.js লোড হয়নি।</div>";
    return;
  }

  const text = filterText.trim().toLowerCase();
  const items = window.suras.filter(s => {
    if (!text) return true;
    const numStr = String(s.number);
    const bn = (s.nameBn || "").toLowerCase();
    const ar = (s.nameAr || "").toLowerCase();
    return (
      numStr.startsWith(text) ||
      bn.includes(text) ||
      ar.includes(text)
    );
  });

  if (items.length === 0) {
    surahListContainer.innerHTML =
      "<div style='padding:8px;font-size:13px;color:#9ca3af;'>কিছু পাওয়া যায়নি।</div>";
    return;
  }

  surahListContainer.innerHTML = "";

  items.forEach(s => {
    const row = document.createElement("div");
    row.className = "surah-item";

    row.innerHTML = `
      <div class="surah-left">
        <div class="surah-index">${s.number}</div>
        <div class="surah-texts">
          <div class="surah-name-bn">${s.nameBn}</div>
          <div class="surah-meta">${s.type} • ${s.ayahCount} আয়াত</div>
        </div>
      </div>
      <div class="surah-ar">${s.nameAr}</div>
    `;

    row.addEventListener("click", () => {
      handleSurahSelect(s);
    });

    surahListContainer.appendChild(row);
  });
}

function openSurahSheet() {
  surahSheet.classList.add("visible");
}

function closeSurahSheet() {
  surahSheet.classList.remove("visible");
}

// ---------- Event handlers ----------

function handleSurahSelect(s) {
  // For now, just save to localStorage and close sheet
  saveLastSurah({
    number: s.number,
    nameBn: s.nameBn,
    nameAr: s.nameAr,
    ayah: 1
  });
  updateLastReadUI();
  closeSurahSheet();
  alert(`নির্বাচিত: ${s.number}. ${s.nameBn}`);
}

function handleContinue() {
  const last = loadLastSurah();
  if (!last) {
    alert("এখনো কোনো সূরা নির্বাচন করা হয়নি। আগে সূরা নির্বাচন করুন।");
    return;
  }
  alert(
    `Continue: ${last.number}. ${last.nameBn} (আয়াত ${last.ayah || 1})\n\nপরবর্তী ধাপে এখানে আয়াত লোড করা যাবে।`
  );
}

function handleSettings() {
  alert("Settings screen এখনও বানানো হয়নি। পরে এখানে অপশন আসবে ইন শা আল্লাহ।");
}

// ---------- Wire events once DOM is ready ----------

document.addEventListener("DOMContentLoaded", () => {
  // Initial UI
  updateLastReadUI();
  renderSurahList("");

  // Open/close sheet
  openSurahListBtn?.addEventListener("click", openSurahSheet);
  closeSurahSheetBtn?.addEventListener("click", closeSurahSheet);

  // Click outside to close
  surahSheet?.addEventListener("click", (e) => {
    if (e.target === surahSheet) {
      closeSurahSheet();
    }
  });

  // Search
  surahSearchInput?.addEventListener("input", (e) => {
    renderSurahList(e.target.value);
  });
  surahSearchClearBtn?.addEventListener("click", () => {
    surahSearchInput.value = "";
    renderSurahList("");
  });

  // Continue + settings
  continueBtn?.addEventListener("click", handleContinue);
  settingsBtn?.addEventListener("click", handleSettings);
});
