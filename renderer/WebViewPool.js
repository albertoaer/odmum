export class WebViewPool {
    #pool = [];
    #poolSize;

    constructor(poolSize) {
        this.#poolSize = poolSize || 1;
        console.log(this.#poolSize);
        this.#preparePool();
    }

    #createViewTag() {
        let template = document.createElement('div');
        template.innerHTML += `<webview></webview>`;
        this.#pool.unshift(template.firstChild); //Insert the browser at the begining of the pool
    }

    async #preparePool() {
        let num = this.#poolSize - this.#pool.length;
        for (let i = 0; i < num; i++) {
            this.#createViewTag();
        }
    }

    pickView() {
        console.log(this.#pool)
        if (this.#pool.length == 0) this.#createViewTag();
        if (this.#pool.length > 0) {
            let view = this.#pool.pop();
            this.#preparePool();
            return view;
        } else console.error("View must have been created");
        return null;
    }
}

//TODO: Checkout for a browser.activeConfiguration.poolSize property
export default new WebViewPool();