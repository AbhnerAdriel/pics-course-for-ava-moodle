(function () {
    "use strict";

    const ELEMENT_NAME = "pics-pillar-stack";
    const CARD_SELECTOR = "[data-stack-card]";
    const COVER_DISTANCE = 88;

    if (!("customElements" in window) || window.customElements.get(ELEMENT_NAME)) {
        return;
    }

    class PicsPillarStack extends HTMLElement {
        constructor() {
            super();

            this._connected = false;
            this._cards = [];
            this._enterObserver = null;
            this._animationFrame = 0;
            this._requestStackUpdate = this._requestStackUpdate.bind(this);
        }

        connectedCallback() {
            if (this._connected) return;

            this._connected = true;
            this._cards = [...this.querySelectorAll(CARD_SELECTOR)];

            if (!this._cards.length) return;

            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (!reducedMotion && "IntersectionObserver" in window) {
                this._enterObserver = new IntersectionObserver((entries, observer) => {
                    for (const entry of entries) {
                        if (!entry.isIntersecting) continue;

                        entry.target.classList.add("is-entered");
                        observer.unobserve(entry.target);
                    }
                }, {
                    threshold: 0.16,
                    rootMargin: "0px 0px -12% 0px"
                });

                this._cards.forEach((card) => this._enterObserver.observe(card));
            } else {
                this._cards.forEach((card) => card.classList.add("is-entered"));
            }

            window.addEventListener("scroll", this._requestStackUpdate, {passive: true});
            window.addEventListener("resize", this._requestStackUpdate);

            this._updateStackState();
        }

        disconnectedCallback() {
            this._connected = false;

            window.removeEventListener("scroll", this._requestStackUpdate);
            window.removeEventListener("resize", this._requestStackUpdate);

            if (this._enterObserver) {
                this._enterObserver.disconnect();
                this._enterObserver = null;
            }

            if (this._animationFrame) {
                window.cancelAnimationFrame(this._animationFrame);
                this._animationFrame = 0;
            }
        }

        _stickyTopFor(index) {
            if (window.innerWidth <= 560) return 78 + index * 10;
            if (window.innerWidth <= 820) return 82 + index * 13;
            return 104 + index * 15;
        }

        _updateStackState() {
            this._cards.forEach((card, index) => {
                const nextCard = this._cards[index + 1];

                if (!nextCard) {
                    card.classList.remove("is-covered");
                    return;
                }

                const nextTop = nextCard.getBoundingClientRect().top;
                const nextStickyTop = this._stickyTopFor(index + 1);

                card.classList.toggle("is-covered", nextTop <= nextStickyTop + COVER_DISTANCE);
            });
        }

        _requestStackUpdate() {
            if (this._animationFrame) return;

            this._animationFrame = window.requestAnimationFrame(() => {
                this._animationFrame = 0;
                if (this._connected) this._updateStackState();
            });
        }
    }

    window.customElements.define(ELEMENT_NAME, PicsPillarStack);
})();
