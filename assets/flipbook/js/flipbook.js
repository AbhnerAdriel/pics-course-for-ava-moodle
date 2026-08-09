/*
 * PICS Flipbook - zero external JavaScript dependencies.
 * Designed as a reusable custom element for Moodle/SPA content.
 */
(() => {
  "use strict";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

  const ICONS = {
    first: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 5h2v14H6V5Zm12.4 1.4L16.98 5 10 12l6.98 7 1.42-1.4L12.82 12l5.58-5.6Z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 5.4 14 4l-8 8 8 8 1.4-1.4L8.8 12l6.6-6.6Z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m8.6 18.6 1.4 1.4 8-8-8-8-1.4 1.4 6.6 6.6-6.6 6.6Z"/></svg>',
    last: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 5h2v14h-2V5ZM5.6 17.6 7.02 19 14 12 7.02 5 5.6 6.4l5.58 5.6-5.58 5.6Z"/></svg>',
    zoomOut: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 11h6v2H9v-2Zm2.5-7a7.5 7.5 0 1 1 0 15 7.45 7.45 0 0 1-4.72-1.67L2.7 21.4 1.3 20l4.07-4.08A7.5 7.5 0 0 1 11.5 4Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z"/></svg>',
    zoomIn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 8h2v3h3v2h-3v3h-2v-3h-3v-2h3V8Zm1-4a7.5 7.5 0 1 1 0 15 7.45 7.45 0 0 1-4.72-1.67L2.7 21.4 1.3 20l4.07-4.08A7.5 7.5 0 0 1 11.5 4Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z"/></svg>',
    reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5a7 7 0 1 1-6.32 4H8L5 6 2 9h1.57A9 9 0 1 0 12 3v2Z"/></svg>',
    thumbs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm9-2h7v7h-7v-7Zm2 2v3h3v-3h-3Z"/></svg>',
    fullscreen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h6v2H6v4H4V4Zm10 0h6v6h-2V6h-4V4ZM4 14h2v4h4v2H4v-6Zm14 0h2v6h-6v-2h4v-4Z"/></svg>',
    source: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm1 3.4L18.6 9H15V5.4ZM6 20V4h7v7h5v9H6Zm2-6h8v2H8v-2Zm0 3h8v2H8v-2Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z"/></svg>'
  };

  class PicsFlipbook extends HTMLElement {
    constructor() {
      super();
      this.pages = [];
      this.manifest = null;
      this.manifestUrl = null;
      this.pdfUrl = null;
      this.states = [];
      this.stateIndex = 0;
      this.currentPage = 0;
      this.mode = "single";
      this.zoom = 1;
      this.minZoom = 0.75;
      this.maxZoom = 3;
      this.zoomStep = 0.25;
      this.turning = null;
      this.animationFrame = 0;
      this.resizeObserver = null;
      this.abortController = null;
      this.reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
      this.initialized = false;
      this._hintTimer = 0;
      this._resizeRaf = 0;
      this._cornerHoverRaf = 0;
      this._pendingCornerEvent = null;
      this._lastLayoutMetrics = null;
    }

    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.classList.add("pics-flipbook");
      this._renderShell();
      this._bindEvents();
      this._load().catch((error) => this._showError(error));
    }

    disconnectedCallback() {
      this.abortController?.abort();
      this.resizeObserver?.disconnect();
      cancelAnimationFrame(this.animationFrame);
      cancelAnimationFrame(this._resizeRaf);
      cancelAnimationFrame(this._cornerHoverRaf);
      clearTimeout(this._hintTimer);
      if (this.classList.contains("is-pseudo-fullscreen")) {
        this.classList.remove("is-pseudo-fullscreen");
        document.documentElement.style.removeProperty("overflow");
      }
      this.initialized = false;
    }

    static get observedAttributes() {
      return ["src", "title"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.initialized || oldValue === newValue) return;
      if (name === "title" && this.refs?.title) {
        this.refs.title.textContent = newValue || this.manifest?.title || "Flipbook";
      }
      if (name === "src") {
        this._load().catch((error) => this._showError(error));
      }
    }

    async setPages(config) {
      this._hideError();
      this._setLoading(true);
      if (!config || !Array.isArray(config.pages) || !config.pages.length) {
        throw new Error("setPages() requires a config object with a non-empty pages array.");
      }
      this.manifest = config;
      this.manifestUrl = document.baseURI;
      this.pdfUrl = config.sourcePdf ? new URL(config.sourcePdf, document.baseURI).href : null;
      this.pages = config.pages.map((page, index) => ({
        ...page,
        number: page.number || index + 1,
        type: page.type || (index === 0 || index === config.pages.length - 1 ? "hard" : "soft"),
        src: new URL(page.src, document.baseURI).href,
        thumb: new URL(page.thumb || page.src, document.baseURI).href,
        alt: page.alt || `Página ${index + 1} de ${config.pages.length}`
      }));
      await this._finishLoad();
    }

    _renderShell() {
      this.innerHTML = `
        <section class="pics-flipbook__frame" aria-label="Leitor de flipbook digital">
          <header class="pics-flipbook__header">
            <div class="pics-flipbook__heading-wrap">
              <p class="pics-flipbook__eyebrow">Leitura interativa</p>
              <h3 class="pics-flipbook__title">Carregando flipbook...</h3>
            </div>
            <span class="pics-flipbook__meta" aria-hidden="true">PDF • <span data-ref="meta-count">0 páginas</span></span>
          </header>

          <div class="pics-flipbook__toolbar" role="toolbar" aria-label="Controles do flipbook">
            <div class="pics-flipbook__toolbar-group" aria-label="Navegação">
              <button class="pics-flipbook__button" type="button" data-action="first" title="Primeira página" aria-label="Ir para a primeira página">${ICONS.first}</button>
              <button class="pics-flipbook__button" type="button" data-action="prev" title="Página anterior" aria-label="Página anterior">${ICONS.prev}</button>
              <label class="pics-flipbook__page-control" title="Ir diretamente para uma página">
                <span class="pics-flipbook__sr-only">Página</span>
                <input class="pics-flipbook__page-input" data-ref="page-input" type="number" min="1" value="1" inputmode="numeric" aria-label="Número da página">
                <span aria-hidden="true">/ <span data-ref="page-total">0</span></span>
              </label>
              <button class="pics-flipbook__button" type="button" data-action="next" title="Próxima página" aria-label="Próxima página">${ICONS.next}</button>
              <button class="pics-flipbook__button" type="button" data-action="last" title="Última página" aria-label="Ir para a última página">${ICONS.last}</button>
            </div>

            <div class="pics-flipbook__toolbar-group pics-flipbook__toolbar-group--center" aria-label="Zoom">
              <button class="pics-flipbook__button" type="button" data-action="zoom-out" title="Diminuir zoom" aria-label="Diminuir zoom">${ICONS.zoomOut}</button>
              <span class="pics-flipbook__zoom-label" data-ref="zoom-label" aria-live="polite">100%</span>
              <button class="pics-flipbook__button" type="button" data-action="zoom-in" title="Aumentar zoom" aria-label="Aumentar zoom">${ICONS.zoomIn}</button>
              <button class="pics-flipbook__button" type="button" data-action="zoom-reset" title="Restaurar zoom" aria-label="Restaurar zoom para 100%">${ICONS.reset}</button>
            </div>

            <div class="pics-flipbook__toolbar-group" aria-label="Visualização">
              <button class="pics-flipbook__button" type="button" data-action="thumbs" title="Miniaturas" aria-label="Mostrar miniaturas" aria-expanded="false">${ICONS.thumbs}</button>
              <button class="pics-flipbook__button" type="button" data-action="source" title="Abrir PDF original" aria-label="Abrir PDF original em nova aba">${ICONS.source}</button>
              <button class="pics-flipbook__button" type="button" data-action="fullscreen" title="Tela cheia" aria-label="Alternar tela cheia" aria-pressed="false">${ICONS.fullscreen}</button>
            </div>
          </div>

          <div class="pics-flipbook__viewport" data-ref="viewport" tabindex="0" aria-label="Área de leitura. Use as setas para navegar, mais e menos para zoom.">
            <div class="pics-flipbook__zoom-space" data-ref="zoom-space">
              <div class="pics-flipbook__book-shell" data-ref="book-shell">
                <div class="pics-flipbook__book" data-ref="book" data-mode="single">
                  <div class="pics-flipbook__page pics-flipbook__page--left pics-flipbook__page--blank" data-ref="left-page" aria-hidden="true"></div>
                  <div class="pics-flipbook__page pics-flipbook__page--right pics-flipbook__page--blank" data-ref="right-page" aria-hidden="true"></div>
                  <div class="pics-flipbook__corner-cue pics-flipbook__corner-cue--backward" aria-hidden="true"></div>
                  <div class="pics-flipbook__corner-cue pics-flipbook__corner-cue--forward" aria-hidden="true"></div>
                  <div class="pics-flipbook__edge pics-flipbook__edge--backward" data-direction="backward" aria-hidden="true"></div>
                  <div class="pics-flipbook__edge pics-flipbook__edge--forward" data-direction="forward" aria-hidden="true"></div>
                </div>
              </div>
            </div>
            <div class="pics-flipbook__hint" data-ref="hint">Arraste pelos cantos para folhear • use +/− para ampliar</div>
            <div class="pics-flipbook__loading" data-ref="loading">
              <div class="pics-flipbook__loading-card">
                <div class="pics-flipbook__spinner" aria-hidden="true"></div>
                <strong>Preparando o flipbook...</strong>
              </div>
            </div>
          </div>

          <footer class="pics-flipbook__footer">
            <label class="pics-flipbook__sr-only" for="">Progresso de páginas</label>
            <input class="pics-flipbook__progress" data-ref="progress" type="range" min="1" max="1" value="1" aria-label="Ir para uma página pelo controle de progresso">
            <span class="pics-flipbook__status" data-ref="status">Carregando...</span>
            <span class="pics-flipbook__sr-only" data-ref="live" aria-live="polite"></span>
          </footer>

          <aside class="pics-flipbook__thumbs" data-ref="thumbs" aria-label="Miniaturas das páginas" hidden>
            <div class="pics-flipbook__thumbs-head">
              <h4 class="pics-flipbook__thumbs-title">Páginas</h4>
              <button class="pics-flipbook__button" type="button" data-action="thumbs-close" aria-label="Fechar miniaturas" title="Fechar miniaturas">${ICONS.close}</button>
            </div>
            <div class="pics-flipbook__thumbs-grid" data-ref="thumbs-grid"></div>
          </aside>
        </section>
      `;

      const q = (selector) => this.querySelector(selector);
      this.refs = {
        frame: q(".pics-flipbook__frame"),
        title: q(".pics-flipbook__title"),
        metaCount: q('[data-ref="meta-count"]'),
        pageInput: q('[data-ref="page-input"]'),
        pageTotal: q('[data-ref="page-total"]'),
        zoomLabel: q('[data-ref="zoom-label"]'),
        viewport: q('[data-ref="viewport"]'),
        zoomSpace: q('[data-ref="zoom-space"]'),
        bookShell: q('[data-ref="book-shell"]'),
        book: q('[data-ref="book"]'),
        leftPage: q('[data-ref="left-page"]'),
        rightPage: q('[data-ref="right-page"]'),
        loading: q('[data-ref="loading"]'),
        progress: q('[data-ref="progress"]'),
        status: q('[data-ref="status"]'),
        live: q('[data-ref="live"]'),
        hint: q('[data-ref="hint"]'),
        thumbs: q('[data-ref="thumbs"]'),
        thumbsGrid: q('[data-ref="thumbs-grid"]'),
        edgeForward: q('[data-direction="forward"]'),
        edgeBackward: q('[data-direction="backward"]')
      };
    }

    _bindEvents() {
      this.abortController?.abort();
      this.abortController = new AbortController();
      const signal = this.abortController.signal;

      this.addEventListener("click", (event) => {
        const button = event.target.closest?.("[data-action]");
        if (!button || button.disabled) return;
        const action = button.dataset.action;
        if (action === "first") this.goToPage(0, { animate: false });
        if (action === "prev") this.previous();
        if (action === "next") this.next();
        if (action === "last") this.goToPage(this.pages.length - 1, { animate: false });
        if (action === "zoom-out") this.setZoom(this.zoom - this.zoomStep);
        if (action === "zoom-in") this.setZoom(this.zoom + this.zoomStep);
        if (action === "zoom-reset") this.setZoom(1);
        if (action === "thumbs") this._toggleThumbs();
        if (action === "thumbs-close") this._toggleThumbs(false);
        if (action === "fullscreen") this._toggleFullscreen();
        if (action === "source") this._openSourcePdf();
      }, { signal });

      this.refs.pageInput.addEventListener("change", () => this._goFromPageInput(), { signal });
      this.refs.pageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this._goFromPageInput();
          this.refs.viewport.focus();
        }
      }, { signal });

      this.refs.progress.addEventListener("input", (event) => {
        this.goToPage(Number(event.target.value) - 1, { animate: false });
      }, { signal });

      this.refs.viewport.addEventListener("keydown", (event) => this._onKeydown(event), { signal });
      this.refs.viewport.addEventListener("dblclick", (event) => {
        if (event.target.closest(".pics-flipbook__book")) {
          this.setZoom(this.zoom > 1.1 ? 1 : 1.75);
        }
      }, { signal });

      this.refs.book.addEventListener("pointermove", (event) => this._queueCornerHover(event), { signal });
      this.refs.book.addEventListener("pointerleave", () => this._clearCornerHover(), { signal });

      [this.refs.edgeForward, this.refs.edgeBackward].forEach((edge) => {
        edge.addEventListener("pointerdown", (event) => this._onTurnPointerDown(event), { signal });
        edge.addEventListener("pointermove", (event) => this._onTurnPointerMove(event), { signal });
        edge.addEventListener("pointerup", (event) => this._onTurnPointerUp(event), { signal });
        edge.addEventListener("pointercancel", (event) => this._onTurnPointerCancel(event), { signal });
      });

      document.addEventListener("fullscreenchange", () => this._syncFullscreenButton(), { signal });

      this.resizeObserver = new ResizeObserver(() => this._scheduleLayout());
      this.resizeObserver.observe(this.refs.viewport);
    }

    async _load() {
      const src = this.getAttribute("src");
      if (!src) {
        throw new Error("Informe o atributo src com o caminho do PDF ou do manifest.json.");
      }
      this._setLoading(true);
      this._hideError();

      const sourceUrl = new URL(src, document.baseURI);
      const isPdf = /\.pdf(?:$|[?#])/i.test(sourceUrl.href);
      const manifestUrl = isPdf ? this._deriveManifestUrl(sourceUrl) : sourceUrl;
      this.pdfUrl = isPdf ? sourceUrl.href : null;
      this.manifestUrl = manifestUrl.href;

      let response;
      try {
        response = await fetch(manifestUrl.href, {
          credentials: "same-origin",
          signal: this.abortController?.signal
        });
      } catch (error) {
        if (error?.name === "AbortError") return;
        throw new Error(`Não foi possível carregar o manifesto do flipbook. ${error.message}`);
      }
      if (!response.ok) {
        const hint = isPdf
          ? " Gere as imagens com tools/pdf_to_flipbook.py antes de publicar o curso."
          : "";
        throw new Error(`Manifesto não encontrado (${response.status}).${hint}`);
      }

      const manifest = await response.json();
      if (!manifest || !Array.isArray(manifest.pages) || !manifest.pages.length) {
        throw new Error("O manifest.json não possui uma lista válida de páginas.");
      }

      this.manifest = manifest;
      if (!this.pdfUrl && manifest.sourcePdf) {
        this.pdfUrl = new URL(manifest.sourcePdf, manifestUrl.href).href;
      }
      this.pages = manifest.pages.map((page, index) => ({
        ...page,
        number: page.number || index + 1,
        type: page.type || (index === 0 || index === manifest.pages.length - 1 ? "hard" : "soft"),
        src: new URL(page.src, manifestUrl.href).href,
        thumb: new URL(page.thumb || page.src, manifestUrl.href).href,
        alt: page.alt || `Página ${index + 1} de ${manifest.pages.length}`
      }));

      await this._finishLoad();
    }

    async _finishLoad() {
      this._hideError();
      this.currentPage = 0;
      this.zoom = 1;
      this._completedEmitted = false;
      const ratio = Number(this.manifest?.pageSize?.aspectRatio) || 0.70665;
      this.style.setProperty("--pf-page-ratio", String(ratio));
      this.refs.book.style.setProperty("--pf-page-ratio", String(ratio));
      this.refs.title.textContent = this.getAttribute("title") || this.manifest?.title || "Flipbook";
      this.refs.metaCount.textContent = `${this.pages.length} ${this.pages.length === 1 ? "página" : "páginas"}`;
      this.refs.pageTotal.textContent = String(this.pages.length);
      this.refs.pageInput.max = String(this.pages.length);
      this.refs.progress.max = String(this.pages.length);
      this._renderThumbnails();
      this._layout(false);
      this._setLoading(false);
      this._preloadAround(0);
      await nextFrame();
      this._showHint();
    }

    _deriveManifestUrl(pdfUrl) {
      const url = new URL(pdfUrl.href);
      const path = url.pathname.replace(/\.pdf$/i, ".flipbook/manifest.json");
      url.pathname = path;
      url.search = "";
      url.hash = "";
      return url;
    }

    _scheduleLayout() {
      if (!this.pages.length || !this.refs?.viewport) return;
      if (this._resizeRaf) return;

      this._resizeRaf = requestAnimationFrame(() => {
        this._resizeRaf = 0;
        const rect = this.refs.viewport.getBoundingClientRect();
        const width = Math.round(rect.width * 2) / 2;
        const height = Math.round(rect.height * 2) / 2;
        const previous = this._lastLayoutMetrics;

        // ResizeObserver can fire repeatedly when a scrollbar appears/disappears.
        // Using the border-box rectangle and ignoring sub-pixel noise prevents the
        // layout from feeding back into itself ("infinite trembling").
        if (
          previous &&
          Math.abs(previous.width - width) < 0.75 &&
          Math.abs(previous.height - height) < 0.75
        ) {
          return;
        }

        this._layout(true, { width, height });
      });
    }

    _resolveMode(vw, vh) {
      const ratio = vw / Math.max(1, vh);
      const hasLayout = this.states.length > 0;

      if (!hasLayout) {
        const landscapeSpread = vw >= 590 && ratio >= 1.42;
        return (vw >= 780 || landscapeSpread) ? "spread" : "single";
      }

      // Hysteresis deliberately uses different enter/leave thresholds.
      // This prevents single/spread mode from oscillating around a breakpoint.
      if (this.mode === "spread") {
        const keepLandscapeSpread = vw >= 550 && ratio >= 1.28;
        return (vw >= 720 || keepLandscapeSpread) ? "spread" : "single";
      }

      const enterLandscapeSpread = vw >= 600 && ratio >= 1.42;
      return (vw >= 780 || enterLandscapeSpread) ? "spread" : "single";
    }

    _layout(preservePage = true, measuredSize = null) {
      if (!this.pages.length || !this.refs.viewport) return;

      if (this.turning) {
        // A resize/orientation change in the middle of a flip otherwise leaves
        // the 3D sheet with dimensions from the previous layout.
        this._cancelTurn(true);
      }

      const rect = this.refs.viewport.getBoundingClientRect();
      const outerWidth = measuredSize?.width ?? Math.round(rect.width * 2) / 2;
      const outerHeight = measuredSize?.height ?? Math.round(rect.height * 2) / 2;
      if (!outerWidth || !outerHeight) return;

      this._lastLayoutMetrics = { width: outerWidth, height: outerHeight };

      const currentPage = preservePage ? this.currentPage : 0;
      const vw = Math.max(180, outerWidth - 32);
      const vh = Math.max(160, outerHeight - 32);
      const pageRatio = Number(this.manifest?.pageSize?.aspectRatio) || 0.70665;

      const nextMode = this._resolveMode(vw, vh);
      const modeChanged = nextMode !== this.mode;
      this.mode = nextMode;
      this.refs.book.dataset.mode = this.mode;

      if (modeChanged || !this.states.length) {
        this._buildStates(currentPage);
      }

      const bookRatio = this.mode === "spread" ? pageRatio * 2 : pageRatio;
      let width = vw * 0.96;
      let height = width / bookRatio;
      if (height > vh * 0.96) {
        height = vh * 0.96;
        width = height * bookRatio;
      }

      // Quantize dimensions to half CSS pixels. Tiny fractional differences
      // produced by zoom/devicePixelRatio should never retrigger visible motion.
      width = Math.round(Math.max(120, width) * 2) / 2;
      height = Math.round(Math.max(160, height) * 2) / 2;

      const sizeChanged =
        Math.abs((this._baseBookWidth || 0) - width) >= 0.5 ||
        Math.abs((this._baseBookHeight || 0) - height) >= 0.5;

      this._baseBookWidth = width;
      this._baseBookHeight = height;

      if (sizeChanged || modeChanged) {
        this.refs.bookShell.style.width = `${width}px`;
        this.refs.bookShell.style.height = `${height}px`;
      }

      this._applyZoomSpace(false);
      this._renderCurrentState(false);
    }

    _buildStates(preferredPage = this.currentPage) {
      const states = [];
      if (this.mode === "single") {
        this.pages.forEach((_, index) => states.push({ left: null, right: index }));
      } else {
        states.push({ left: null, right: 0 });
        for (let index = 1; index < this.pages.length; index += 2) {
          states.push({ left: index, right: index + 1 < this.pages.length ? index + 1 : null });
        }
      }
      this.states = states;
      const found = states.findIndex((state) => state.left === preferredPage || state.right === preferredPage);
      this.stateIndex = found >= 0 ? found : 0;
      this.currentPage = clamp(preferredPage, 0, Math.max(0, this.pages.length - 1));
    }

    _renderCurrentState(announce = true) {
      if (!this.states.length) return;
      this._renderState(this.states[this.stateIndex]);
      this._syncControls(announce);
    }

    _renderState(state) {
      if (this.mode === "single") {
        this._setPageElement(this.refs.leftPage, null, "left");
        this._setPageElement(this.refs.rightPage, state.right, "right");
      } else {
        this._setPageElement(this.refs.leftPage, state.left, "left");
        this._setPageElement(this.refs.rightPage, state.right, "right");
      }
    }

    _setPageElement(element, pageIndex, side) {
      element.className = `pics-flipbook__page pics-flipbook__page--${side}`;
      element.replaceChildren();
      element.removeAttribute("aria-label");
      element.removeAttribute("role");

      if (pageIndex == null || !this.pages[pageIndex]) {
        element.classList.add("pics-flipbook__page--blank");
        element.setAttribute("aria-hidden", "true");
        return;
      }

      const page = this.pages[pageIndex];
      element.classList.add(`pics-flipbook__page--${page.type === "hard" ? "hard" : "soft"}`);
      element.removeAttribute("aria-hidden");
      element.setAttribute("role", "img");
      element.setAttribute("aria-label", page.alt);
      element.dataset.page = String(pageIndex + 1);

      const img = document.createElement("img");
      img.className = "pics-flipbook__page-image";
      img.src = page.src;
      img.alt = "";
      img.draggable = false;
      img.decoding = "async";
      img.fetchPriority = pageIndex === this.currentPage ? "high" : "auto";
      img.addEventListener("error", () => element.classList.add("is-image-error"), { once: true });
      element.appendChild(img);
    }

    _syncControls(announce = true) {
      const state = this.states[this.stateIndex] || { left: null, right: 0 };
      const visible = [state.left, state.right].filter((page) => page != null);
      if (!visible.includes(this.currentPage)) {
        this.currentPage = visible[0] ?? 0;
      }

      const hasPrev = this.stateIndex > 0;
      const hasNext = this.stateIndex < this.states.length - 1;
      this.querySelector('[data-action="first"]').disabled = !hasPrev;
      this.querySelector('[data-action="prev"]').disabled = !hasPrev;
      this.querySelector('[data-action="next"]').disabled = !hasNext;
      this.querySelector('[data-action="last"]').disabled = !hasNext;
      this.refs.edgeBackward.toggleAttribute("disabled", !hasPrev);
      this.refs.edgeForward.toggleAttribute("disabled", !hasNext);
      this.refs.edgeBackward.style.pointerEvents = hasPrev ? "auto" : "none";
      this.refs.edgeForward.style.pointerEvents = hasNext ? "auto" : "none";

      this.refs.pageInput.value = String(this.currentPage + 1);
      this.refs.progress.value = String(this.currentPage + 1);
      this.refs.zoomLabel.textContent = `${Math.round(this.zoom * 100)}%`;
      const label = this._visiblePagesLabel(state);
      this.refs.status.textContent = label;
      if (announce) {
        this.refs.live.textContent = label;
        this.dispatchEvent(new CustomEvent("pics-flipbook:pagechange", {
          bubbles: true,
          detail: {
            currentPage: this.currentPage + 1,
            visiblePages: visible.map((page) => page + 1),
            totalPages: this.pages.length,
            stateIndex: this.stateIndex
          }
        }));
        if (this.stateIndex === this.states.length - 1 && !this._completedEmitted) {
          this._completedEmitted = true;
          this.dispatchEvent(new CustomEvent("pics-flipbook:complete", {
            bubbles: true,
            detail: { totalPages: this.pages.length }
          }));
        }
      }

      this.querySelector('[data-action="zoom-out"]').disabled = this.zoom <= this.minZoom + 0.001;
      this.querySelector('[data-action="zoom-in"]').disabled = this.zoom >= this.maxZoom - 0.001;
      this.querySelector('[data-action="source"]').disabled = !this.pdfUrl;

      this.refs.thumbsGrid.querySelectorAll(".pics-flipbook__thumb").forEach((thumb, index) => {
        if (index === this.currentPage) thumb.setAttribute("aria-current", "page");
        else thumb.removeAttribute("aria-current");
      });
    }

    _visiblePagesLabel(state) {
      const visible = [state.left, state.right].filter((page) => page != null).map((page) => page + 1);
      if (!visible.length) return `0 de ${this.pages.length}`;
      if (visible.length === 1) return `Página ${visible[0]} de ${this.pages.length}`;
      return `Páginas ${visible[0]}–${visible[1]} de ${this.pages.length}`;
    }

    next() {
      if (this.turning || this.stateIndex >= this.states.length - 1) return;
      this._turnTo(this.stateIndex + 1, "forward");
    }

    previous() {
      if (this.turning || this.stateIndex <= 0) return;
      this._turnTo(this.stateIndex - 1, "backward");
    }

    goToPage(pageIndex, { animate = false } = {}) {
      if (!this.pages.length) return;
      const targetPage = clamp(Number(pageIndex) || 0, 0, this.pages.length - 1);
      const targetState = this.states.findIndex((state) => state.left === targetPage || state.right === targetPage);
      if (targetState < 0) return;
      this.currentPage = targetPage;

      if (animate && Math.abs(targetState - this.stateIndex) === 1) {
        const direction = targetState > this.stateIndex ? "forward" : "backward";
        this._turnTo(targetState, direction, targetPage);
        return;
      }

      this._cancelTurn(true);
      this.stateIndex = targetState;
      this._renderCurrentState(true);
      this._preloadAround(targetPage);
      this._centerBookIfNeeded();
    }

    _goFromPageInput() {
      const page = clamp(parseInt(this.refs.pageInput.value, 10) || 1, 1, this.pages.length);
      this.goToPage(page - 1, { animate: false });
    }

    _turnTo(targetStateIndex, direction, targetPage = null) {
      if (this.turning) return;
      const turn = this._prepareTurn(targetStateIndex, direction, targetPage);
      if (!turn) return;
      this._animateTurn(0, 1, turn.hard ? 720 : 560, true);
    }

    _prepareTurn(targetStateIndex, direction, targetPage = null) {
      if (targetStateIndex < 0 || targetStateIndex >= this.states.length) return null;
      const currentState = this.states[this.stateIndex];
      const targetState = this.states[targetStateIndex];
      let frontIndex = null;
      let backIndex = null;

      if (this.mode === "single") {
        frontIndex = currentState.right;
        backIndex = targetState.right;
        this._setPageElement(this.refs.leftPage, null, "left");
        this._setPageElement(this.refs.rightPage, targetState.right, "right");
      } else if (direction === "forward") {
        frontIndex = currentState.right;
        backIndex = targetState.left;
        this._setPageElement(this.refs.leftPage, currentState.left, "left");
        this._setPageElement(this.refs.rightPage, targetState.right, "right");
      } else {
        frontIndex = currentState.left;
        backIndex = targetState.right;
        this._setPageElement(this.refs.leftPage, targetState.left, "left");
        this._setPageElement(this.refs.rightPage, currentState.right, "right");
      }

      if (frontIndex == null || backIndex == null) {
        this.stateIndex = targetStateIndex;
        this.currentPage = targetPage ?? (targetState.left ?? targetState.right ?? 0);
        this._renderCurrentState(true);
        return null;
      }

      const front = this.pages[frontIndex];
      const back = this.pages[backIndex];
      const turn = document.createElement("div");
      const isHard = front?.type === "hard";
      turn.className = `pics-flipbook__turn pics-flipbook__turn--${direction} pics-flipbook__turn--${isHard ? "hard" : "soft"}`;
      turn.innerHTML = `
        <div class="pics-flipbook__turn-face pics-flipbook__turn-face--front"></div>
        <div class="pics-flipbook__turn-face pics-flipbook__turn-face--back"></div>
      `;
      this._fillTurnFace(turn.children[0], front, frontIndex);
      this._fillTurnFace(turn.children[1], back, backIndex);
      this.refs.book.appendChild(turn);

      this.turning = {
        element: turn,
        direction,
        targetStateIndex,
        originalStateIndex: this.stateIndex,
        targetPage,
        frontIndex,
        backIndex,
        progress: 0,
        hard: isHard,
        dragging: false,
        pointerId: null,
        startX: 0,
        lastX: 0,
        startTime: 0,
        cornerSign: 0
      };
      this._setTurnProgress(0);
      return this.turning;
    }

    _fillTurnFace(face, page, pageIndex) {
      if (!page) return;
      face.classList.add(`pics-flipbook__page--${page.type === "hard" ? "hard" : "soft"}`);
      const img = document.createElement("img");
      img.className = "pics-flipbook__turn-image";
      img.src = page.src;
      img.alt = "";
      img.draggable = false;
      img.decoding = "async";
      face.appendChild(img);
      face.setAttribute("aria-hidden", "true");
      face.dataset.page = String(pageIndex + 1);
    }

    _setTurnProgress(progress) {
      if (!this.turning) return;
      const p = clamp(progress, 0, 1);
      this.turning.progress = p;
      this.refs.book.style.setProperty("--pf-turn-progress", String(p));
      const angle = (this.turning.direction === "forward" ? -180 : 180) * p;
      const bend = this.turning.hard ? 0 : Math.sin(Math.PI * p);
      const corner = this.turning.cornerSign || 0;
      const rotateZ = corner * bend * (this.turning.direction === "forward" ? -1 : 1) * 1.4;
      const scaleX = 1 - bend * (this.turning.hard ? 0.002 : 0.018);
      const lift = bend * (this.turning.hard ? 1 : 5);
      this.turning.element.style.transform = `rotateY(${angle}deg) rotateZ(${rotateZ}deg) translateZ(${lift}px) scaleX(${scaleX})`;
    }

    _animateTurn(from, to, duration, commit) {
      if (!this.turning) return;
      cancelAnimationFrame(this.animationFrame);
      const turnRef = this.turning;
      const actualDuration = this.reduceMotion ? 1 : Math.max(1, duration * Math.abs(to - from));
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);

      const tick = (now) => {
        if (!this.turning || this.turning !== turnRef) return;
        const elapsed = clamp((now - start) / actualDuration, 0, 1);
        const value = from + (to - from) * ease(elapsed);
        this._setTurnProgress(value);
        if (elapsed < 1) {
          this.animationFrame = requestAnimationFrame(tick);
        } else if (commit) {
          this._commitTurn();
        } else {
          this._cancelTurn(false);
        }
      };
      this.animationFrame = requestAnimationFrame(tick);
    }

    _commitTurn() {
      if (!this.turning) return;
      const targetStateIndex = this.turning.targetStateIndex;
      const targetPage = this.turning.targetPage;
      this.turning.element.remove();
      this.turning = null;
      this.refs.book.style.removeProperty("--pf-turn-progress");
      this.stateIndex = targetStateIndex;
      const state = this.states[this.stateIndex];
      this.currentPage = targetPage ?? (state.left ?? state.right ?? this.currentPage);
      this._renderCurrentState(true);
      this._preloadAround(this.currentPage);
      this._clearCornerHover();
    }

    _cancelTurn(immediate = false) {
      if (!this.turning) return;
      cancelAnimationFrame(this.animationFrame);
      const originalStateIndex = this.turning.originalStateIndex;
      if (!immediate && this.turning.progress > 0.001) {
        this._animateTurn(this.turning.progress, 0, 360, false);
        return;
      }
      this.turning.element.remove();
      this.turning = null;
      this.stateIndex = originalStateIndex;
      this.refs.book.style.removeProperty("--pf-turn-progress");
      this._renderCurrentState(false);
    }

    _onTurnPointerDown(event) {
      if (event.button !== 0 || this.turning) return;
      const direction = event.currentTarget.dataset.direction;
      const canTurn = direction === "forward"
        ? this.stateIndex < this.states.length - 1
        : this.stateIndex > 0;
      if (!canTurn) return;

      const targetStateIndex = direction === "forward" ? this.stateIndex + 1 : this.stateIndex - 1;
      const turn = this._prepareTurn(targetStateIndex, direction);
      if (!turn) return;

      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const rect = this.refs.book.getBoundingClientRect();
      turn.dragging = true;
      turn.pointerId = event.pointerId;
      turn.startX = event.clientX;
      turn.lastX = event.clientX;
      turn.startTime = performance.now();
      turn.cornerSign = event.clientY < rect.top + rect.height / 2 ? -1 : 1;
      this._clearCornerHover();
    }

    _onTurnPointerMove(event) {
      const turn = this.turning;
      if (!turn?.dragging || turn.pointerId !== event.pointerId) return;
      event.preventDefault();
      turn.lastX = event.clientX;
      const rect = this.refs.book.getBoundingClientRect();
      const pageWidth = this.mode === "spread" ? rect.width / 2 : rect.width;
      const distance = turn.direction === "forward"
        ? turn.startX - event.clientX
        : event.clientX - turn.startX;
      const progress = clamp(distance / Math.max(1, pageWidth * 0.92), 0, 1);
      this._setTurnProgress(progress);
    }

    _onTurnPointerUp(event) {
      const turn = this.turning;
      if (!turn?.dragging || turn.pointerId !== event.pointerId) return;
      event.preventDefault();
      turn.dragging = false;
      const elapsed = Math.max(1, performance.now() - turn.startTime);
      const signedDistance = turn.direction === "forward"
        ? turn.startX - event.clientX
        : event.clientX - turn.startX;
      const velocity = signedDistance / elapsed;
      const isClick = turn.progress < 0.025 && elapsed < 330;
      const commit = isClick || turn.progress >= 0.32 || (turn.progress >= 0.08 && velocity > 0.52);
      if (commit) {
        this._animateTurn(turn.progress, 1, turn.hard ? 620 : 460, true);
      } else {
        this._animateTurn(turn.progress, 0, 330, false);
      }
    }

    _onTurnPointerCancel(event) {
      const turn = this.turning;
      if (!turn?.dragging || turn.pointerId !== event.pointerId) return;
      turn.dragging = false;
      this._animateTurn(turn.progress, 0, 260, false);
    }

    _queueCornerHover(event) {
      if (event.pointerType === "touch") return;
      this._pendingCornerEvent = {
        clientX: event.clientX,
        clientY: event.clientY,
        pointerType: event.pointerType
      };
      if (this._cornerHoverRaf) return;

      this._cornerHoverRaf = requestAnimationFrame(() => {
        this._cornerHoverRaf = 0;
        const pending = this._pendingCornerEvent;
        this._pendingCornerEvent = null;
        if (pending) this._onCornerHover(pending);
      });
    }

    _onCornerHover(event) {
      if (this.turning || event.pointerType === "touch") return;

      const rect = this.refs.book.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const fromLeft = localX;
      const fromRight = rect.width - localX;
      const fromTop = localY;
      const fromBottom = rect.height - localY;

      const canPrev = this.stateIndex > 0;
      const canNext = this.stateIndex < this.states.length - 1;

      // The visual curl now appears only at the actual corners, not along an
      // entire edge strip. This removes the large detached triangle.
      const edgeZone = clamp(rect.width * (this.mode === "spread" ? 0.055 : 0.09), 34, 72);
      const verticalZone = clamp(rect.height * 0.16, 52, 108);
      const isTop = fromTop <= verticalZone;
      const isBottom = fromBottom <= verticalZone;

      const nearForward = canNext && fromRight <= edgeZone && (isTop || isBottom);
      const nearBackward = canPrev && fromLeft <= edgeZone && (isTop || isBottom);

      if (!nearForward && !nearBackward) {
        this._clearCornerHover();
        return;
      }

      const horizontalDistance = nearForward ? fromRight : fromLeft;
      const verticalDistance = Math.min(fromTop, fromBottom);
      const horizontalProximity = 1 - clamp(horizontalDistance / edgeZone, 0, 1);
      const verticalProximity = 1 - clamp(verticalDistance / verticalZone, 0, 1);
      const intensity = clamp((horizontalProximity * 0.62) + (verticalProximity * 0.38), 0, 1);
      const size = Math.round(34 + intensity * 24);

      this.refs.book.style.setProperty("--pf-corner-size", `${size}px`);
      this.refs.book.style.setProperty("--pf-corner-intensity", intensity.toFixed(3));
      this.refs.book.classList.toggle("is-corner-forward", nearForward);
      this.refs.book.classList.toggle("is-corner-backward", nearBackward);
      this.refs.book.classList.toggle("is-corner-top", isTop);
      this.refs.book.classList.toggle("is-corner-bottom", !isTop && isBottom);
    }

    _clearCornerHover() {
      cancelAnimationFrame(this._cornerHoverRaf);
      this._cornerHoverRaf = 0;
      this._pendingCornerEvent = null;
      this.refs.book.classList.remove(
        "is-corner-forward",
        "is-corner-backward",
        "is-corner-top",
        "is-corner-bottom"
      );
      this.refs.book.style.removeProperty("--pf-corner-size");
      this.refs.book.style.removeProperty("--pf-corner-intensity");
    }

    setZoom(value) {
      if (!this.pages.length) return;
      const next = clamp(Math.round(value * 100) / 100, this.minZoom, this.maxZoom);
      if (Math.abs(next - this.zoom) < 0.001) return;
      const viewport = this.refs.viewport;
      const oldScrollWidth = Math.max(1, this.refs.zoomSpace.scrollWidth);
      const oldScrollHeight = Math.max(1, this.refs.zoomSpace.scrollHeight);
      const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / oldScrollWidth;
      const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / oldScrollHeight;
      this.zoom = next;
      this._applyZoomSpace(true);
      requestAnimationFrame(() => {
        viewport.scrollLeft = centerX * this.refs.zoomSpace.scrollWidth - viewport.clientWidth / 2;
        viewport.scrollTop = centerY * this.refs.zoomSpace.scrollHeight - viewport.clientHeight / 2;
      });
      this._syncControls(false);
    }

    _applyZoomSpace() {
      if (!this._baseBookWidth || !this._baseBookHeight) return;
      const viewport = this.refs.viewport;
      const rect = viewport.getBoundingClientRect();
      const viewportWidth = Math.max(1, Math.round(rect.width));
      const viewportHeight = Math.max(1, Math.round(rect.height));
      const scaledWidth = this._baseBookWidth * this.zoom;
      const scaledHeight = this._baseBookHeight * this.zoom;
      const margin = 32;

      // At 100% the book is guaranteed to fit. Keeping overflow hidden here
      // prevents scrollbar appearance from changing the viewport's clientWidth
      // and starting a ResizeObserver feedback loop.
      const zoomed = this.zoom > 1.001;
      viewport.classList.toggle("is-zoomed", zoomed);

      const spaceWidth = Math.max(viewportWidth, Math.ceil(scaledWidth + margin));
      const spaceHeight = Math.max(viewportHeight, Math.ceil(scaledHeight + margin));
      const left = Math.max(16, Math.round((spaceWidth - scaledWidth) / 2));
      const top = Math.max(16, Math.round((spaceHeight - scaledHeight) / 2));

      this.refs.zoomSpace.style.width = `${spaceWidth}px`;
      this.refs.zoomSpace.style.height = `${spaceHeight}px`;
      this.refs.bookShell.style.left = `${left}px`;
      this.refs.bookShell.style.top = `${top}px`;
      this.refs.bookShell.style.transform = `scale(${this.zoom})`;
    }

    _centerBookIfNeeded() {
      if (this.zoom <= 1.01) {
        this.refs.viewport.scrollTo({ left: 0, top: 0, behavior: this.reduceMotion ? "auto" : "smooth" });
      }
    }

    _renderThumbnails() {
      const fragment = document.createDocumentFragment();
      this.refs.thumbsGrid.replaceChildren();
      this.pages.forEach((page, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "pics-flipbook__thumb";
        button.dataset.page = String(index);
        button.innerHTML = `<img alt="" loading="lazy" decoding="async"><span>Página ${index + 1}</span>`;
        const img = button.querySelector("img");
        img.src = page.thumb;
        button.addEventListener("click", () => {
          this.goToPage(index, { animate: false });
          this._toggleThumbs(false);
          this.refs.viewport.focus();
        });
        fragment.appendChild(button);
      });
      this.refs.thumbsGrid.appendChild(fragment);
    }

    _toggleThumbs(force) {
      const shouldOpen = typeof force === "boolean" ? force : this.refs.thumbs.hidden;
      this.refs.thumbs.hidden = !shouldOpen;
      const button = this.querySelector('[data-action="thumbs"]');
      button.setAttribute("aria-expanded", String(shouldOpen));
      if (shouldOpen) {
        const current = this.refs.thumbsGrid.querySelector(`[data-page="${this.currentPage}"]`);
        current?.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }

    async _toggleFullscreen() {
      if (document.fullscreenElement === this) {
        await document.exitFullscreen?.();
        return;
      }
      if (this.classList.contains("is-pseudo-fullscreen")) {
        this.classList.remove("is-pseudo-fullscreen");
        document.documentElement.style.removeProperty("overflow");
        this._syncFullscreenButton();
        this._layout(true);
        return;
      }

      try {
        if (this.requestFullscreen) {
          await this.requestFullscreen({ navigationUI: "hide" });
        } else {
          throw new Error("Fullscreen API unavailable");
        }
      } catch {
        this.classList.add("is-pseudo-fullscreen");
        document.documentElement.style.overflow = "hidden";
        this._syncFullscreenButton();
        this._layout(true);
      }
    }

    _syncFullscreenButton() {
      const active = document.fullscreenElement === this || this.classList.contains("is-pseudo-fullscreen");
      this.querySelector('[data-action="fullscreen"]')?.setAttribute("aria-pressed", String(active));
      setTimeout(() => this._layout(true), 40);
    }

    _openSourcePdf() {
      if (!this.pdfUrl) return;
      const anchor = document.createElement("a");
      anchor.href = this.pdfUrl;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.click();
    }

    _onKeydown(event) {
      if (event.target.matches("input")) return;
      const key = event.key;
      if (["ArrowRight", "PageDown"].includes(key)) {
        event.preventDefault();
        this.next();
      } else if (["ArrowLeft", "PageUp"].includes(key)) {
        event.preventDefault();
        this.previous();
      } else if (key === "Home") {
        event.preventDefault();
        this.goToPage(0);
      } else if (key === "End") {
        event.preventDefault();
        this.goToPage(this.pages.length - 1);
      } else if (["+", "="].includes(key)) {
        event.preventDefault();
        this.setZoom(this.zoom + this.zoomStep);
      } else if (key === "-") {
        event.preventDefault();
        this.setZoom(this.zoom - this.zoomStep);
      } else if (key === "0") {
        event.preventDefault();
        this.setZoom(1);
      } else if (key.toLowerCase() === "f") {
        event.preventDefault();
        this._toggleFullscreen();
      } else if (key.toLowerCase() === "t") {
        event.preventDefault();
        this._toggleThumbs();
      } else if (key === "Escape" && this.classList.contains("is-pseudo-fullscreen")) {
        event.preventDefault();
        this.classList.remove("is-pseudo-fullscreen");
        document.documentElement.style.removeProperty("overflow");
        this._syncFullscreenButton();
      }
    }

    _preloadAround(pageIndex) {
      const candidates = new Set();
      for (let offset = -2; offset <= 3; offset += 1) {
        const index = pageIndex + offset;
        if (index >= 0 && index < this.pages.length) candidates.add(index);
      }
      const state = this.states[this.stateIndex];
      [state?.left, state?.right].forEach((index) => index != null && candidates.add(index));
      candidates.forEach((index) => {
        const img = new Image();
        img.decoding = "async";
        img.src = this.pages[index].src;
      });
    }

    _showHint() {
      if (!this.refs.hint || this.reduceMotion) return;
      this.refs.hint.classList.add("is-visible");
      clearTimeout(this._hintTimer);
      this._hintTimer = setTimeout(() => this.refs.hint.classList.remove("is-visible"), 4200);
    }

    _setLoading(active) {
      if (!this.refs?.loading) return;
      this.refs.loading.hidden = !active;
      this.refs.loading.style.display = active ? "grid" : "none";
    }

    _showError(error) {
      console.error("[PICS Flipbook]", error);
      this._setLoading(false);
      this._hideError();
      const box = document.createElement("div");
      box.className = "pics-flipbook__error";
      box.dataset.ref = "error";
      const card = document.createElement("div");
      card.className = "pics-flipbook__error-card";
      const strong = document.createElement("strong");
      strong.textContent = "Não foi possível abrir o flipbook.";
      const message = document.createElement("div");
      message.textContent = error?.message || String(error);
      card.append(strong, message);
      box.appendChild(card);
      this.refs.viewport.appendChild(box);
      this.refs.status.textContent = "Falha ao carregar";
      this.refs.live.textContent = "Falha ao carregar o flipbook";
    }

    _hideError() {
      this.querySelector('[data-ref="error"]')?.remove();
    }
  }

  if (!customElements.get("pics-flipbook")) {
    customElements.define("pics-flipbook", PicsFlipbook);
  }

  window.PicsFlipbook = PicsFlipbook;
})();
