(function () {
    "use strict";

    const ELEMENT_NAME = "pics-horizontal-timeline";
    const EVENTS_CLASS = "pics-horizontal-timeline__events";
    const MIN_EVENT_DISTANCE = 74;
    const LABEL_GAP = 24;
    const EDGE_GAP = 24;
    const SWIPE_DISTANCE = 50;
    const ANIMATION_FALLBACK = 500;
    const MOTION_CLASSES = [
        "pics-horizontal-timeline__enter-from-right",
        "pics-horizontal-timeline__enter-from-left",
        "pics-horizontal-timeline__leave-to-left",
        "pics-horizontal-timeline__leave-to-right"
    ];

    if (!("customElements" in window) || window.customElements.get(ELEMENT_NAME)) {
        return;
    }

    let instanceCount = 0;

    class PicsHorizontalTimeline extends HTMLElement {
        constructor() {
            super();

            instanceCount += 1;
            this._uid = `${ELEMENT_NAME}-${instanceCount}`;
            this._connected = false;
            this._boundForConnection = false;
            this._events = null;
            this._items = [];
            this._tabs = [];
            this._positions = [];
            this._selectedIndex = -1;
            this._selectedItem = null;
            this._translation = 0;
            this._totalWidth = 0;
            this._layoutFrame = 0;
            this._refreshFrame = 0;
            this._ensureSelectedOnLayout = false;
            this._pointerStart = null;
            this._activeTransitionFinish = null;
            this._listenerController = null;
            this._mutationObserver = null;
            this._resizeObserver = null;
            this._ui = null;
            this._viewport = null;
            this._rail = null;
            this._fill = null;
            this._previousButton = null;
            this._nextButton = null;
        }

        connectedCallback() {
            if (this._connected) {
                return;
            }

            this._connected = true;
            this._boundForConnection = false;
            this._listenerController = new AbortController();
            this._connect();

            if (!this._events && document.readyState === "loading") {
                document.addEventListener(
                    "DOMContentLoaded",
                    () => this._connect(),
                    {
                        once: true,
                        signal: this._listenerController.signal
                    }
                );
            }
        }

        disconnectedCallback() {
            this._connected = false;
            this._finishTransition();

            if (this._listenerController) {
                this._listenerController.abort();
                this._listenerController = null;
            }

            if (this._mutationObserver) {
                this._mutationObserver.disconnect();
                this._mutationObserver = null;
            }

            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                this._resizeObserver = null;
            }

            if (this._layoutFrame) {
                cancelAnimationFrame(this._layoutFrame);
                this._layoutFrame = 0;
            }

            if (this._refreshFrame) {
                cancelAnimationFrame(this._refreshFrame);
                this._refreshFrame = 0;
            }

            this._pointerStart = null;
            this._boundForConnection = false;
        }

        _connect() {
            if (!this._connected) {
                return;
            }

            const events = this._findEventsList();

            if (
                events &&
                this._ui &&
                this._events === events &&
                this.contains(this._ui)
            ) {
                this._refreshItems();
                this._bindEvents();
                this._startObservers();
                this._scheduleLayout(true);
                return;
            }

            if (events) {
                if (this._ui && this.contains(this._ui)) {
                    this._ui.remove();
                }

                this._events = events;
                this._buildInterface();
                this._bindEvents();
                this._startObservers();
                this._scheduleLayout(true);
                return;
            }

            this._watchForMarkup();
        }

        _findEventsList() {
            return (
                Array.from(this.children).find(
                    (child) =>
                        child.tagName === "OL" &&
                        child.classList.contains(EVENTS_CLASS)
                ) || null
            );
        }

        _watchForMarkup() {
            if (this._mutationObserver) {
                this._mutationObserver.disconnect();
            }

            this._mutationObserver = new MutationObserver(() => {
                if (this._findEventsList()) {
                    this._mutationObserver.disconnect();
                    this._mutationObserver = null;
                    this._connect();
                }
            });

            this._mutationObserver.observe(this, {
                childList: true,
                subtree: true
            });
        }

        _buildInterface() {
            const timeline = document.createElement("div");
            timeline.className = "pics-horizontal-timeline__timeline";
            timeline.setAttribute("data-timeline-ui", "");

            const previousButton = this._createNavigationButton(
                "previous",
                "Voltar no trilho da linha do tempo"
            );
            const nextButton = this._createNavigationButton(
                "next",
                "Avançar no trilho da linha do tempo"
            );

            const viewport = document.createElement("div");
            viewport.className = "pics-horizontal-timeline__viewport";
            viewport.setAttribute("data-timeline-viewport", "");

            const rail = document.createElement("div");
            rail.className = "pics-horizontal-timeline__rail";
            rail.setAttribute("data-timeline-rail", "");
            rail.setAttribute("role", "tablist");
            rail.setAttribute("aria-orientation", "horizontal");
            rail.setAttribute(
                "aria-label",
                this.getAttribute("aria-label") || "Linha do tempo"
            );

            const fill = document.createElement("span");
            fill.className = "pics-horizontal-timeline__filling-line";
            fill.setAttribute("aria-hidden", "true");
            rail.append(fill);

            viewport.append(rail);
            timeline.append(previousButton, viewport, nextButton);
            this._events.before(timeline);

            this._ui = timeline;
            this._viewport = viewport;
            this._rail = rail;
            this._fill = fill;
            this._previousButton = previousButton;
            this._nextButton = nextButton;

            if (!this.hasAttribute("role")) {
                this.setAttribute("role", "region");
            }

            this._events.setAttribute("role", "presentation");
            this.setAttribute("data-timeline-enhanced", "");
            this._refreshItems(true);
        }

        _createNavigationButton(direction, label) {
            const button = document.createElement("button");
            const text = document.createElement("span");

            button.type = "button";
            button.className =
                `pics-horizontal-timeline__nav ` +
                `pics-horizontal-timeline__nav--${direction}`;
            button.setAttribute("data-timeline-action", direction);
            button.setAttribute("aria-label", label);

            text.className = "pics-horizontal-timeline__visually-hidden";
            text.textContent = label;
            button.append(text);

            return button;
        }

        _eventItems() {
            if (!this._events) {
                return [];
            }

            return Array.from(this._events.children).filter(
                (child) =>
                    child.tagName === "LI" &&
                    child.hasAttribute("data-timeline-event")
            );
        }

        _refreshItems(isInitial) {
            if (!this._events || !this._rail) {
                return;
            }

            this._finishTransition();

            const previousItem = this._selectedItem;
            const items = this._eventItems();

            this._tabs.forEach((tab) => tab.remove());
            this._tabs = [];
            this._items = items;

            let selectedIndex = items.indexOf(previousItem);

            if (selectedIndex < 0) {
                selectedIndex = items.findIndex(
                    (item) =>
                        item.hasAttribute("data-selected") ||
                        item.hasAttribute("data-timeline-selected") ||
                        item.getAttribute("aria-current") === "step"
                );
            }

            if (selectedIndex < 0 && items.length > 0) {
                selectedIndex = 0;
            }

            items.forEach((item, index) => {
                const tab = document.createElement("button");
                const label = this._labelFor(item, index);
                const panelId = item.id || `${this._uid}-panel-${index + 1}`;
                const tabId = `${this._uid}-tab-${index + 1}`;
                const isSelected = index === selectedIndex;

                if (!item.id) {
                    item.id = panelId;
                    item.setAttribute("data-timeline-generated-id", "");
                }

                item.setAttribute("role", "tabpanel");
                item.setAttribute("aria-labelledby", tabId);
                item.setAttribute("tabindex", "0");
                item.toggleAttribute("data-timeline-selected", isSelected);
                item.setAttribute("aria-hidden", String(!isSelected));
                item.hidden = !isSelected;
                item.toggleAttribute("inert", !isSelected);
                MOTION_CLASSES.forEach((className) =>
                    item.classList.remove(className)
                );

                tab.type = "button";
                tab.id = tabId;
                tab.className = "pics-horizontal-timeline__tab";
                tab.textContent = label;
                tab.setAttribute("role", "tab");
                tab.setAttribute("aria-controls", panelId);
                tab.setAttribute("aria-selected", String(isSelected));
                tab.setAttribute("aria-posinset", String(index + 1));
                tab.setAttribute("aria-setsize", String(items.length));
                tab.setAttribute("tabindex", isSelected ? "0" : "-1");
                tab.setAttribute("data-timeline-index", String(index));
                tab.toggleAttribute("data-timeline-past", index < selectedIndex);

                this._rail.append(tab);
                this._tabs.push(tab);
            });

            this._selectedIndex = selectedIndex;
            this._selectedItem =
                selectedIndex >= 0 ? items[selectedIndex] : null;
            this._translation = 0;

            if (isInitial) {
                this.removeAttribute("data-timeline-ready");
            }

            this._restartResizeObserver();
            this._scheduleLayout(true);
        }

        _labelFor(item, index) {
            const explicitLabel = (item.getAttribute("data-label") || "").trim();

            if (explicitLabel) {
                return explicitLabel;
            }

            const heading = item.querySelector("h2, h3, h4, time");
            const inferredLabel = heading ? heading.textContent.trim() : "";

            return inferredLabel || `Etapa ${index + 1}`;
        }

        _bindEvents() {
            if (
                this._boundForConnection ||
                !this._listenerController ||
                !this._ui ||
                !this._events
            ) {
                return;
            }

            const signal = this._listenerController.signal;

            this._ui.addEventListener(
                "click",
                (event) => this._handleControlClick(event),
                { signal }
            );
            this._rail.addEventListener(
                "keydown",
                (event) => this._handleTabKeydown(event),
                { signal }
            );
            this._events.addEventListener(
                "pointerdown",
                (event) => this._handlePointerDown(event),
                { signal }
            );
            this._events.addEventListener(
                "pointerup",
                (event) => this._handlePointerUp(event),
                { signal }
            );
            this._events.addEventListener(
                "pointercancel",
                () => {
                    this._pointerStart = null;
                },
                { signal }
            );

            if (!("ResizeObserver" in window)) {
                window.addEventListener(
                    "resize",
                    () => this._scheduleLayout(true),
                    { signal }
                );
            }

            this._boundForConnection = true;
        }

        _handleControlClick(event) {
            const target =
                event.target instanceof Element
                    ? event.target.closest("button")
                    : null;

            if (!target || !this._ui.contains(target)) {
                return;
            }

            if (target.hasAttribute("data-timeline-index")) {
                const index = Number(target.getAttribute("data-timeline-index"));
                this._selectIndex(index);
                return;
            }

            const action = target.getAttribute("data-timeline-action");

            if (action === "previous") {
                this._translateByPage(-1);
            } else if (action === "next") {
                this._translateByPage(1);
            }
        }

        _handleTabKeydown(event) {
            const target =
                event.target instanceof Element
                    ? event.target.closest("[data-timeline-index]")
                    : null;

            if (!target || !this._rail.contains(target)) {
                return;
            }

            const currentIndex = Number(
                target.getAttribute("data-timeline-index")
            );
            let nextIndex = null;

            switch (event.key) {
                case "ArrowLeft":
                case "ArrowUp":
                    nextIndex = Math.max(0, currentIndex - 1);
                    break;
                case "ArrowRight":
                case "ArrowDown":
                    nextIndex = Math.min(this._items.length - 1, currentIndex + 1);
                    break;
                case "Home":
                    nextIndex = 0;
                    break;
                case "End":
                    nextIndex = this._items.length - 1;
                    break;
                default:
                    return;
            }

            event.preventDefault();
            this._selectIndex(nextIndex, { focusTab: true });
        }

        _handlePointerDown(event) {
            if (event.pointerType !== "touch" && event.pointerType !== "pen") {
                return;
            }

            this._pointerStart = {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY
            };
        }

        _handlePointerUp(event) {
            const start = this._pointerStart;
            this._pointerStart = null;

            if (!start || start.id !== event.pointerId) {
                return;
            }

            const distanceX = event.clientX - start.x;
            const distanceY = event.clientY - start.y;

            if (
                Math.abs(distanceX) < SWIPE_DISTANCE ||
                Math.abs(distanceX) <= Math.abs(distanceY) * 1.2
            ) {
                return;
            }

            const nextIndex =
                distanceX < 0
                    ? this._selectedIndex + 1
                    : this._selectedIndex - 1;

            if (nextIndex >= 0 && nextIndex < this._items.length) {
                this._selectIndex(nextIndex);
            }
        }

        _startObservers() {
            if (this._mutationObserver) {
                this._mutationObserver.disconnect();
            }

            this._mutationObserver = new MutationObserver((records) => {
                const structureChanged = records.some((record) => {
                    if (record.type === "childList") {
                        if (record.target === this) {
                            return (
                                !this.contains(this._events) ||
                                !this.contains(this._ui)
                            );
                        }

                        return record.target === this._events;
                    }

                    return (
                        record.type === "attributes" &&
                        record.target.parentElement === this._events
                    );
                });

                if (!structureChanged) {
                    return;
                }

                if (!this.contains(this._events) || !this.contains(this._ui)) {
                    this._recoverInterface();
                } else {
                    this._scheduleRefresh();
                }
            });

            this._mutationObserver.observe(this, { childList: true });
            this._mutationObserver.observe(this._events, {
                childList: true,
                attributes: true,
                attributeFilter: ["data-label", "data-timeline-event"]
            });

            this._restartResizeObserver();
        }

        _restartResizeObserver() {
            if (!("ResizeObserver" in window) || !this._viewport) {
                return;
            }

            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
            }

            this._resizeObserver = new ResizeObserver(() => {
                this._scheduleLayout(true);
            });
            this._resizeObserver.observe(this._viewport);

            if (this._selectedItem) {
                this._resizeObserver.observe(this._selectedItem);
            }
        }

        _scheduleRefresh() {
            if (this._refreshFrame) {
                return;
            }

            this._refreshFrame = requestAnimationFrame(() => {
                this._refreshFrame = 0;

                if (this._connected && this.contains(this._events)) {
                    this._refreshItems();
                }
            });
        }

        _recoverInterface() {
            if (!this._connected) {
                return;
            }

            this._finishTransition();

            if (this._ui && this.contains(this._ui)) {
                this._ui.remove();
            }

            if (this._mutationObserver) {
                this._mutationObserver.disconnect();
                this._mutationObserver = null;
            }

            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                this._resizeObserver = null;
            }

            if (this._listenerController) {
                this._listenerController.abort();
            }

            this._listenerController = new AbortController();
            this._boundForConnection = false;
            this._ui = null;
            this._viewport = null;
            this._rail = null;
            this._fill = null;
            this._previousButton = null;
            this._nextButton = null;
            this._tabs = [];
            this._items = [];
            this._events = null;
            this._selectedItem = null;
            this._selectedIndex = -1;
            this.removeAttribute("data-timeline-enhanced");
            this.removeAttribute("data-timeline-ready");
            this._connect();
        }

        _scheduleLayout(ensureSelected) {
            this._ensureSelectedOnLayout =
                this._ensureSelectedOnLayout || Boolean(ensureSelected);

            if (this._layoutFrame) {
                return;
            }

            this._layoutFrame = requestAnimationFrame(() => {
                const shouldEnsure = this._ensureSelectedOnLayout;
                this._layoutFrame = 0;
                this._ensureSelectedOnLayout = false;
                this._layout(shouldEnsure);
                this._syncPanelHeight();
            });
        }

        _layout(ensureSelected) {
            if (!this._viewport || !this._rail || this._tabs.length === 0) {
                this._updateNavigation();
                return;
            }

            const viewportWidth = this._viewport.clientWidth;

            if (viewportWidth <= 0) {
                return;
            }

            const widths = this._tabs.map((tab) => {
                const width = tab.getBoundingClientRect().width || tab.scrollWidth;
                return Math.max(40, Math.ceil(width));
            });
            const firstPadding = Math.max(EDGE_GAP, widths[0] / 2 + 8);
            const lastPadding = Math.max(
                EDGE_GAP,
                widths[widths.length - 1] / 2 + 8
            );
            const positions = [firstPadding];

            for (let index = 1; index < widths.length; index += 1) {
                const labelDistance =
                    widths[index - 1] / 2 + widths[index] / 2 + LABEL_GAP;
                positions.push(
                    positions[index - 1] +
                        Math.max(MIN_EVENT_DISTANCE, labelDistance)
                );
            }

            let totalWidth =
                positions[positions.length - 1] + lastPadding;

            if (totalWidth <= viewportWidth) {
                totalWidth = viewportWidth;

                if (positions.length === 1) {
                    positions[0] = totalWidth / 2;
                } else {
                    const distributable =
                        totalWidth - firstPadding - lastPadding;
                    const step = distributable / (positions.length - 1);

                    positions.forEach((unused, index) => {
                        positions[index] = firstPadding + step * index;
                    });
                }
            }

            this._positions = positions;
            this._totalWidth = Math.ceil(totalWidth);
            this._rail.style.width = `${this._totalWidth}px`;

            this._tabs.forEach((tab, index) => {
                tab.style.left = `${positions[index]}px`;
            });

            this._setTranslation(this._translation);
            this._updateFilling();

            if (ensureSelected) {
                this._ensureTabVisible(this._selectedIndex);
            }

            this.setAttribute("data-timeline-ready", "");
        }

        _translateByPage(direction) {
            if (!this._viewport) {
                return;
            }

            const pageDistance = Math.max(
                MIN_EVENT_DISTANCE,
                this._viewport.clientWidth - MIN_EVENT_DISTANCE
            );
            this._setTranslation(
                this._translation + (direction < 0 ? pageDistance : -pageDistance)
            );
        }

        _setTranslation(value) {
            if (!this._viewport || !this._rail) {
                return;
            }

            const minimum = Math.min(
                0,
                this._viewport.clientWidth - this._totalWidth
            );
            const nextValue = Math.max(minimum, Math.min(0, value || 0));

            this._translation = Math.abs(nextValue) < 0.5 ? 0 : nextValue;
            this._rail.style.transform =
                `translate3d(${this._translation}px, 0, 0)`;
            this._updateNavigation();
        }

        _updateNavigation() {
            if (!this._previousButton || !this._nextButton || !this._viewport) {
                return;
            }

            const minimum = Math.min(
                0,
                this._viewport.clientWidth - this._totalWidth
            );
            const atStart = this._translation >= -0.5;
            const atEnd = this._translation <= minimum + 0.5;

            this._previousButton.disabled = atStart;
            this._nextButton.disabled = atEnd;
            this._previousButton.setAttribute("aria-disabled", String(atStart));
            this._nextButton.setAttribute("aria-disabled", String(atEnd));
        }

        _ensureTabVisible(index) {
            if (
                index < 0 ||
                !this._positions[index] ||
                !this._tabs[index] ||
                !this._viewport
            ) {
                return;
            }

            const safeInset = 20;
            const halfWidth = this._tabs[index].getBoundingClientRect().width / 2;
            const left = this._positions[index] + this._translation - halfWidth;
            const right = this._positions[index] + this._translation + halfWidth;
            let nextTranslation = this._translation;

            if (left < safeInset) {
                nextTranslation += safeInset - left;
            } else if (right > this._viewport.clientWidth - safeInset) {
                nextTranslation -=
                    right - (this._viewport.clientWidth - safeInset);
            }

            this._setTranslation(nextTranslation);
        }

        _updateFilling() {
            if (
                !this._fill ||
                this._selectedIndex < 0 ||
                !this._positions[this._selectedIndex] ||
                this._totalWidth <= 0
            ) {
                if (this._fill) {
                    this._fill.style.transform = "scaleX(0)";
                }
                return;
            }

            const ratio = Math.max(
                0,
                Math.min(
                    1,
                    this._positions[this._selectedIndex] / this._totalWidth
                )
            );
            this._fill.style.transform = `scaleX(${ratio})`;
        }

        _selectIndex(index, options) {
            if (
                !Number.isInteger(index) ||
                index < 0 ||
                index >= this._items.length
            ) {
                return;
            }

            const focusTab = Boolean(options && options.focusTab);

            if (index === this._selectedIndex) {
                this._ensureTabVisible(index);

                if (focusTab && this._tabs[index]) {
                    this._tabs[index].focus({ preventScroll: true });
                }
                return;
            }

            this._finishTransition();

            const previousIndex = this._selectedIndex;
            const previousPanel = this._selectedItem;
            const nextPanel = this._items[index];
            const direction = index > previousIndex ? 1 : -1;
            const currentHeight = this._events.getBoundingClientRect().height;
            const focusWasInsidePrevious = Boolean(
                previousPanel && previousPanel.contains(document.activeElement)
            );

            if (focusWasInsidePrevious && this._tabs[index]) {
                this._tabs[index].focus({ preventScroll: true });
            }

            this._selectedIndex = index;
            this._selectedItem = nextPanel;

            this._items.forEach((panel, itemIndex) => {
                const isSelected = itemIndex === index;

                panel.toggleAttribute("data-timeline-selected", isSelected);
                panel.setAttribute("aria-hidden", String(!isSelected));

                if (isSelected) {
                    panel.hidden = false;
                    panel.removeAttribute("inert");
                } else if (panel !== previousPanel) {
                    panel.hidden = true;
                    panel.setAttribute("inert", "");
                }
            });

            this._tabs.forEach((tab, tabIndex) => {
                const isSelected = tabIndex === index;

                tab.setAttribute("aria-selected", String(isSelected));
                tab.setAttribute("tabindex", isSelected ? "0" : "-1");
                tab.toggleAttribute("data-timeline-past", tabIndex < index);
            });

            this._updateFilling();
            this._ensureTabVisible(index);
            this._restartResizeObserver();

            if (focusTab && this._tabs[index]) {
                this._tabs[index].focus({ preventScroll: true });
            }

            const reduceMotion =
                "matchMedia" in window &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (!previousPanel || reduceMotion) {
                if (previousPanel) {
                    previousPanel.hidden = true;
                    previousPanel.setAttribute("inert", "");
                }

                MOTION_CLASSES.forEach((className) => {
                    if (previousPanel) {
                        previousPanel.classList.remove(className);
                    }
                    nextPanel.classList.remove(className);
                });
                this._syncPanelHeight();
                return;
            }

            previousPanel.hidden = false;
            previousPanel.setAttribute("inert", "");
            MOTION_CLASSES.forEach((className) => {
                previousPanel.classList.remove(className);
                nextPanel.classList.remove(className);
            });

            if (currentHeight > 0) {
                this._events.style.height = `${Math.ceil(currentHeight)}px`;
            }

            void this._events.offsetHeight;

            const enteringClass =
                direction > 0
                    ? "pics-horizontal-timeline__enter-from-right"
                    : "pics-horizontal-timeline__enter-from-left";
            const leavingClass =
                direction > 0
                    ? "pics-horizontal-timeline__leave-to-left"
                    : "pics-horizontal-timeline__leave-to-right";

            nextPanel.classList.add(enteringClass);
            previousPanel.classList.add(leavingClass);
            this._events.setAttribute("data-timeline-animating", "");

            const nextHeight = nextPanel.getBoundingClientRect().height;
            this._events.style.height = `${Math.ceil(nextHeight)}px`;

            let animationTimer = 0;
            const onAnimationEnd = (event) => {
                if (event.target === nextPanel) {
                    finish();
                }
            };
            const finish = () => {
                nextPanel.removeEventListener("animationend", onAnimationEnd);

                if (animationTimer) {
                    clearTimeout(animationTimer);
                    animationTimer = 0;
                }

                previousPanel.hidden = true;
                previousPanel.setAttribute("inert", "");
                MOTION_CLASSES.forEach((className) => {
                    previousPanel.classList.remove(className);
                    nextPanel.classList.remove(className);
                });
                this._events.removeAttribute("data-timeline-animating");
                this._activeTransitionFinish = null;
                this._syncPanelHeight();
            };

            nextPanel.addEventListener("animationend", onAnimationEnd);
            animationTimer = window.setTimeout(finish, ANIMATION_FALLBACK);
            this._activeTransitionFinish = finish;
        }

        _finishTransition() {
            if (this._activeTransitionFinish) {
                const finish = this._activeTransitionFinish;
                this._activeTransitionFinish = null;
                finish();
            }
        }

        _syncPanelHeight() {
            if (!this._events || !this._selectedItem || !this._connected) {
                return;
            }

            const height = this._selectedItem.getBoundingClientRect().height;

            if (height >= 0) {
                this._events.style.height = `${Math.ceil(height)}px`;
            }
        }
    }

    window.customElements.define(ELEMENT_NAME, PicsHorizontalTimeline);
})();
