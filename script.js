(() => {
  "use strict";

  // ---- Template geometry (measured from assets/certificate-template.png, 2000×1415) ----
  const NAME_LINE = { xMin: 128, xMax: 1099, baselineY: 712 };
  const ID_POSITION = { x: 128, y: 1392 };
  const NAME_MAX_FONT = 92;
  const NAME_MIN_FONT = 40;
  const NAME_COLOR = "#173226";
  const ID_COLOR = "#e8c15a";

  const canvas = document.getElementById("certificateCanvas");
  const ctx = canvas.getContext("2d");
  const nameInput = document.getElementById("fullName");
  const downloadBtn = document.getElementById("downloadBtn");
  const idCaption = document.getElementById("idCaption");
  const hint = document.getElementById("hint");
  const logSection = document.getElementById("logSection");
  const logBody = document.getElementById("logBody");
  const exportBtn = document.getElementById("exportBtn");

  const LOG_KEY = "su-ive-2026-certificates";

  let template = null;
  let fontsReady = false;
  let currentId = null;
  let redrawTimer = null;

  const templateImg = new Image();
  templateImg.src = "assets/certificate-template.png";
  templateImg.onload = () => {
    template = templateImg;
    tryInitialDraw();
  };

  document.fonts.load('700 90px "Great Vibes"')
    .then(() => document.fonts.load('500 24px "IBM Plex Mono"'))
    .then(() => { fontsReady = true; tryInitialDraw(); })
    .catch(() => { fontsReady = true; tryInitialDraw(); }); // draw with fallback fonts rather than block forever

  function tryInitialDraw() {
    if (template) draw();
  }

  function genCertificateId() {
    const t = Date.now().toString(36).toUpperCase().slice(-5);
    const r = Math.random().toString(36).toUpperCase().slice(2, 5);
    return `SU-IVE26-${t}${r}`;
  }

  function fitNameFont(name) {
    let size = NAME_MAX_FONT;
    const maxWidth = (NAME_LINE.xMax - NAME_LINE.xMin) * 0.94;
    ctx.save();
    while (size > NAME_MIN_FONT) {
      ctx.font = `400 ${size}px "Great Vibes", "Segoe Script", cursive`;
      if (ctx.measureText(name).width <= maxWidth) break;
      size -= 2;
    }
    ctx.restore();
    return size;
  }

  function draw() {
    if (!template) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    const name = nameInput.value.trim();
    const hasName = name.length > 0;

    downloadBtn.disabled = !hasName;

    if (!hasName) {
      currentId = null;
      idCaption.textContent = "Your certificate ID will appear here once you enter a name.";
      return;
    }

    currentId = genCertificateId();

    const centerX = (NAME_LINE.xMin + NAME_LINE.xMax) / 2;
    const fontSize = fitNameFont(name);
    ctx.font = `400 ${fontSize}px "Great Vibes", "Segoe Script", cursive`;
    ctx.fillStyle = NAME_COLOR;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(name, centerX, NAME_LINE.baselineY);

    ctx.font = '500 24px "IBM Plex Mono", monospace';
    ctx.fillStyle = ID_COLOR;
    ctx.textAlign = "left";
    ctx.fillText(`Certificate ID: ${currentId}`, ID_POSITION.x, ID_POSITION.y);

    idCaption.textContent = `This certificate will carry ID ${currentId}.`;
  }

  function scheduleDraw() {
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(draw, 120);
  }

  nameInput.addEventListener("input", scheduleDraw);

  function loadLog() {
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveLog(entries) {
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify(entries));
    } catch {
      /* storage unavailable — the download itself still works */
    }
  }

  function renderLog() {
    const entries = loadLog();
    if (entries.length === 0) {
      logSection.hidden = true;
      return;
    }
    logSection.hidden = false;
    logBody.innerHTML = entries
      .slice()
      .reverse()
      .map(
        (e) => `<tr><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.id)}</td><td>${escapeHtml(e.when)}</td></tr>`
      )
      .join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  downloadBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name || !currentId) return;

    // Freeze this exact certificate (name + id already drawn on canvas) before triggering the file save.
    const idAtDownload = currentId;
    const link = document.createElement("a");
    link.download = `${idAtDownload}-${name.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    const entries = loadLog();
    entries.push({ name, id: idAtDownload, when: new Date().toLocaleString() });
    saveLog(entries);
    renderLog();

    // Next certificate gets a fresh ID even if the name is unchanged.
    scheduleDraw();
  });

  exportBtn.addEventListener("click", () => {
    const entries = loadLog();
    if (entries.length === 0) return;
    const rows = [["Name", "Certificate ID", "Generated"], ...entries.map((e) => [e.name, e.id, e.when])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.download = "su-ive-2026-certificates.csv";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  });

  renderLog();
})();
