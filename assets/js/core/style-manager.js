const STYLES = Object.freeze({
    home: './assets/css/style-modulo.css',
    unit: './assets/css/style-conteudo.css',
});

export class RouteStyleManager {
    #link;
    #current;

    constructor(linkElement) {
        this.#link = linkElement;
    }

    async use(name) {
        const href = STYLES[name];
        if (!href || this.#current === name) return;
        this.#current = name;

        await new Promise((resolve) => {
            const onDone = () => {
                this.#link.removeEventListener('load', onDone);
                this.#link.removeEventListener('error', onDone);
                resolve();
            };
            this.#link.addEventListener('load', onDone, {once: true});
            this.#link.addEventListener('error', onDone, {once: true});
            this.#link.href = href;
            // Browsers can resolve a cached stylesheet before a load listener is observed.
            setTimeout(resolve, 80);
        });
    }
}
