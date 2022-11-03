export class WebViewPool {
    #pool = [];
    #poolSize;

    constructor(poolSize) {
        this.#poolSize = poolSize || 1;
        this.#preparePool();
    }

    #createViewTag() {
        let template = document.createElement('div');
        template.innerHTML += `<webview allowpopups webpreferences="nativeWindowOpen=true" preload='./plugins/preload.js'></webview>`;
        this.#pool.unshift(template.firstChild); //Insert the browser at the begining of the pool
    }

    async #preparePool() {
        let num = this.#poolSize - this.#pool.length;
        for (let i = 0; i < num; i++) {
            this.#createViewTag();
        }
    }

    pickView() {
        if (this.#pool.length == 0) this.#createViewTag();
        if (this.#pool.length > 0) {
            let view = this.#pool.pop();
            this.#preparePool();
            return view;
        } else console.error("View must have been created");
        return null;
    }
}

export default new WebViewPool(browser.activeConfiguration.poolSize);