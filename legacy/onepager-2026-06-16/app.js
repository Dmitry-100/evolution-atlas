import { ERAS, STAGES } from "./data/lineage.js?v=20260614-5";
import {
  DEFAULT_SCALE,
  ageMaToPosition,
  findNearestStage,
  formatAgeRu,
  sortStagesOldestFirst
} from "./lib/timeline.js?v=20260614-5";

const state = {
  stages: sortStagesOldestFirst(STAGES),
  activeId: null,
  pinned: false,
  mode: "full"
};

const els = {
  wrap: document.querySelector("[data-timeline-wrap]"),
  eraLayer: document.querySelector("[data-era-layer]"),
  stageLayer: document.querySelector("[data-stage-layer]"),
  scrubber: document.querySelector("[data-scrubber]"),
  readout: document.querySelector("[data-time-readout]"),
  pin: document.querySelector("[data-pin-toggle]"),
  modeButtons: [...document.querySelectorAll("[data-mode]")],
  media: document.querySelector("[data-stage-media]"),
  age: document.querySelector("[data-stage-age]"),
  title: document.querySelector("[data-stage-title]"),
  latin: document.querySelector("[data-stage-latin]"),
  summary: document.querySelector("[data-stage-summary]"),
  inherited: document.querySelector("[data-stage-inherited]"),
  note: document.querySelector("[data-stage-note]"),
  credit: document.querySelector("[data-stage-credit]")
};

function currentScale() {
  return state.mode === "primates" ? { minMa: 0.01, maxMa: 66 } : DEFAULT_SCALE;
}

function visibleStages() {
  const scale = currentScale();
  return state.stages.filter((stage) => stage.ageMa >= scale.minMa && stage.ageMa <= scale.maxMa);
}

function setActive(stageId, options = {}) {
  const stage = state.stages.find((item) => item.id === stageId);
  if (!stage) return;
  state.activeId = stage.id;
  if (options.pin !== undefined) state.pinned = options.pin;
  renderCard(stage);
  renderActivePoint();
  syncScrubber(stage);
  updatePinButton();
}

function updatePinButton() {
  els.pin.classList.toggle("is-pinned", state.pinned);
  els.pin.textContent = state.pinned ? "Открепить" : "Закрепить";
}

function renderEras() {
  const scale = currentScale();
  els.eraLayer.replaceChildren();

  for (const era of ERAS) {
    const startMa = Math.min(era.startMa, scale.maxMa);
    const endMa = Math.max(era.endMa, scale.minMa);
    if (era.startMa < scale.minMa || era.endMa > scale.maxMa) continue;

    const start = ageMaToPosition(startMa, scale) * 100;
    const end = ageMaToPosition(endMa || scale.minMa, scale) * 100;
    const band = document.createElement("div");
    band.className = "era-band";
    band.style.left = `${start}%`;
    band.style.width = `${Math.max(2, end - start)}%`;
    band.style.background = era.color;
    band.title = era.label;

    const label = document.createElement("div");
    label.className = "era-label";
    label.style.left = `${start + Math.max(2, end - start) / 2}%`;
    label.textContent = era.label;

    els.eraLayer.append(band, label);
  }
}

function renderTimeline() {
  const scale = currentScale();
  const stages = visibleStages();
  els.stageLayer.replaceChildren();
  els.scrubber.max = String(Math.max(0, stages.length - 1));

  stages.forEach((stage, index) => {
    const positionPercent = ageMaToPosition(stage.ageMa, scale) * 100;
    const point = document.createElement("button");
    point.type = "button";
    point.className = "stage-point";
    if (positionPercent < 8) point.classList.add("is-edge-start");
    if (positionPercent > 92) point.classList.add("is-edge-end");
    point.dataset.stageId = stage.id;
    point.dataset.index = String(index);
    point.style.left = `${positionPercent}%`;
    point.style.background = ERAS.find((era) => era.id === stage.eraId)?.color || "#6bd1ff";
    point.setAttribute("aria-label", `${stage.title}, ${formatAgeRu(stage.ageMa)}`);
    point.innerHTML = `<span class="stage-point-label">${stage.title}</span><span class="stage-point-age">${formatAgeRu(stage.ageMa).replace(" назад", "")}</span>`;
    point.addEventListener("mouseenter", () => {
      if (!state.pinned) setActive(stage.id);
    });
    point.addEventListener("focus", () => {
      if (!state.pinned) setActive(stage.id);
    });
    point.addEventListener("click", () => {
      setActive(stage.id, { pin: true });
    });
    els.stageLayer.append(point);
  });

  const nextActive = stages.find((stage) => stage.id === state.activeId) || stages[0] || state.stages[0];
  setActive(nextActive.id);
}

function renderActivePoint() {
  for (const point of els.stageLayer.querySelectorAll(".stage-point")) {
    point.classList.toggle("is-active", point.dataset.stageId === state.activeId);
  }
}

function renderCard(stage) {
  els.age.textContent = formatAgeRu(stage.ageMa);
  els.title.textContent = stage.title;
  els.latin.textContent = stage.latin;
  els.summary.textContent = stage.summary;
  els.inherited.textContent = stage.inherited;
  els.note.textContent = stage.note;
  els.credit.textContent = `${stage.image.credit}. ${framingText(stage.framing)}`;
  els.readout.textContent = `${formatAgeRu(stage.ageMa)}: ${stage.title}`;
  renderImage(stage);
}

function framingText(framing) {
  const labels = {
    representative: "Представитель этапа",
    "stem-form": "Стволовая или переходная форма",
    "close-relative": "Близкая родственная линия",
    "direct-lineage": "Крупная линия на пути к человеку",
    "side-branch": "Боковая родственная ветвь"
  };
  return labels[framing] || "Эволюционный этап";
}

function renderImage(stage) {
  els.media.replaceChildren();
  const candidates = [stage.image.src, ...(stage.image.remoteFallbacks || [])].filter(Boolean);
  if (candidates.length === 0) {
    renderImageFallback(stage);
    return;
  }

  let index = 0;
  const img = document.createElement("img");
  img.alt = stage.image.alt;
  img.loading = "lazy";
  img.decoding = "async";
  img.onerror = () => {
    index += 1;
    if (index >= candidates.length) {
      renderImageFallback(stage);
      return;
    }
    img.src = candidates[index];
  };
  img.src = candidates[index];
  els.media.append(img);
}

function renderImageFallback(stage) {
  els.media.replaceChildren();
  const fallback = document.createElement("div");
  fallback.className = "image-fallback";
  fallback.innerHTML = `
    <span class="fallback-orbit"></span>
    <strong>${stage.title}</strong>
    <small>${stage.image.alt}</small>
    <em>${framingText(stage.framing)}</em>
  `;
  els.media.append(fallback);
}

function syncScrubber(stage) {
  const stages = visibleStages();
  const index = Math.max(0, stages.findIndex((item) => item.id === stage.id));
  els.scrubber.value = String(index);
}

function bindEvents() {
  els.wrap.addEventListener("pointermove", (event) => {
    if (state.pinned || event.pointerType === "touch") return;
    const rect = els.stageLayer.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    const nearest = findNearestStage(visibleStages(), position, currentScale());
    if (nearest && nearest.id !== state.activeId) setActive(nearest.id);
  });

  els.scrubber.addEventListener("input", () => {
    const stage = visibleStages()[Number(els.scrubber.value)];
    if (stage) setActive(stage.id, { pin: true });
  });

  els.pin.addEventListener("click", () => {
    state.pinned = !state.pinned;
    updatePinButton();
  });

  els.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      state.pinned = false;
      els.modeButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      renderEras();
      renderTimeline();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const stages = visibleStages();
    const current = Math.max(0, stages.findIndex((stage) => stage.id === state.activeId));
    const next = event.key === "ArrowRight" ? Math.min(current + 1, stages.length - 1) : Math.max(current - 1, 0);
    setActive(stages[next].id, { pin: true });
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function init() {
  renderEras();
  renderTimeline();
  bindEvents();
  registerServiceWorker();
}

init();
