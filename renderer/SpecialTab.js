import WebTab from "./WebTab.js";
import webViewPool from "./WebViewPool.js";

export class SpecialTab {
    #view;

    constructor() {
        this.#view = document.getElementById('new');
        this.#view.onclick = this.createTab.bind(this);
        this.#view.ondragover = event => {
            event.dataTransfer.dropEffect = "link";
            event.preventDefault();
        };
        this.#view.ondragenter = _ => this.#view.classList.add('over');
        this.#view.ondragleave = _ => this.#view.classList.remove('over');
        this.#view.ondrop = event => {
            event.preventDefault();
            let owner = event.dataTransfer.getData('owner');
            let id = event.dataTransfer.getData('tab-id');
            if (browser.id == owner) {
                document.querySelector(`#tabs button#tab-${id}`).webtab.close();
                //< 2 because, 1 element is the new tab
                if (document.querySelector(`#tabs`).childElementCount < 2) browser.close();
            }
            this.#view.classList.remove('over');
        };

        this.#view.specialtab = this;
    }

    createTab(configuration={}) {
        let tab = this.#view.parentNode.insertBefore(document.createElement('button'), this.#view);
        let webview = webViewPool.pickView();
        return new WebTab(tab, webview, configuration);
    }
}

export default new SpecialTab();