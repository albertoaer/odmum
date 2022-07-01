import state from "./WindowState.js";
import WebTab from "./WebTab.js";
import webViewPool from "./WebViewPool.js";

export class SpecialTab {
    #view;

    constructor() {
        this.#view = document.getElementById('new');
        this.#view.onclick = this.createTab.bind(this);
        this.#view.ondragover = event => {
            if (event.preventDefault && state.dragging) event.preventDefault();
        };
        this.#view.ondragenter = _ => { if (state.dragging) this.#view.classList.add('over') };
        this.#view.ondragleave = _ => this.#view.classList.remove('over');
        this.#view.ondrop = event => {
            let id = event.dataTransfer.getData('tab-id');
            document.querySelector(`#tabs button#tab-${id}`).webtab.close();
            this.#view.classList.remove('over');
            //< 2 because, 1 element is the new tab
            if (document.querySelector(`#tabs`).childElementCount < 2) browser.close();
        };
    }

    createTab() {
        let tab = this.#view.parentNode.insertBefore(document.createElement('button'), this.#view);
        let webview = webViewPool.pickView();
        return new WebTab(tab, webview, 15);
    }
}

export default new SpecialTab();