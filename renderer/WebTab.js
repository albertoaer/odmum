import tabOptions from "./TabOptions.js";
import ContextMenu from "./ContextMenu.js";
import specialTab from "./SpecialTab.js";

export default class WebTab {
    static #count = 0;
    #id;
    #tab;
    #webview;
    #configuration;
    #savedhistory = [];

    constructor(tab, webview, configuration) {
        this.#id = WebTab.#count;
        this.#tab = tab;
        this.#webview = webview

        this.#configuration = Object.assign({
            titleOverflow: 15,
            defaultSource: browser.activeConfiguration.defaultSource
        }, configuration)

        this.#configureTab()
        this.#tab.webtab = this;

        this.#webview.addEventListener('dom-ready', _ => {
            this.#webview.insertCSS(browser.styles);
        });

        this.#webview.addEventListener('page-favicon-updated', event => {
            if (event.favicons.length > 0) {
                this.#tab.getElementsByTagName('img')[0].src = event.favicons[0];
            }
        });

        this.#webview.addEventListener('page-title-updated', event => {
            if (event.title) {
                let titleView = this.#tab.getElementsByTagName('p')[0];
                titleView.innerText = this.#tab.title = event.title;
                if (event.title.length >= this.#configuration.titleOverflow) {
                    titleView.classList.add('overflow-title');
                } else {
                    titleView.classList.remove('overflow-title');
                }
            }
        });

        this.#webview.addEventListener('context-menu', event => {
            ContextMenu.show(this.#getContextCommands(event), {x: event.params.x, y: event.params.y});
        });

        this.#webview.addEventListener('did-navigate', event => {
            this.#savedhistory.push(event.url);
        });

        this.#webview.addEventListener('did-navigate-in-page', event => {
            if (this.#savedhistory.length > 0 && this.#savedhistory[this.#savedhistory.length-1] != event.url)
                this.#savedhistory.push(event.url);
        });

        this.#webview.src = this.#configuration.defaultSource;

        let center = document.querySelector('#center');
        center.appendChild(this.#webview);
        this.select();

        WebTab.#count++;
    }

    #configureTab() {
        let tab = this.#tab;
        tab.id = `tab-${this.#id}`;
        tab.innerHTML = '<img><p></p><input type="text">';
        tab.onmousedown = event => {
            if (event.which == 1) this.select();
            else if (event.which == 3) {
                if (event.preventDefault) event.preventDefault(); //Avoid focus tab
                if (!this.isSelected) this.select();
                this.showOptions();
            }
        }
        tab.ondblclick = this.edit.bind(this);
        tab.onblur = e => { if(!tab.contains(e.relatedTarget)) tab.classList.remove('edit') };
        tab.getElementsByTagName('input')[0].onblur = () => tab.classList.remove('edit');
        let img = tab.getElementsByTagName('img')[0];
        tab.draggable = true;
        tab.ondragstart = event => {
            event.dataTransfer.setData('tab-id', this.#id);
            event.dataTransfer.setData('owner', browser.id);
            event.dataTransfer.setData('tab-config', JSON.stringify({ defaultSource: this.#webview.src }));
            event.dataTransfer.setDragImage(img, 0, 0);
        }
        tab.ondragover = event => {
            event.dataTransfer.dropEffect = "copy";
            event.preventDefault();
        }
        tab.ondrop = event => {
            event.preventDefault();
            let owner = event.dataTransfer.getData('owner');
            let tabid = event.dataTransfer.getData('tab-id');
            let tabconfig = JSON.parse(event.dataTransfer.getData('tab-config'));
            console.log(tabconfig)
            let ntab = browser.id == owner ? document.querySelector(`#tabs button#tab-${tabid}`) : specialTab.createTab(tabconfig);
            let target = ntab.getBoundingClientRect().x < tab.getBoundingClientRect().x ? tab.nextSibling : tab;
            tab.parentElement.insertBefore(ntab, target);
        }
        tab.ondragend = event => {
            if (event.dataTransfer.dropEffect === 'none') {
                let {screenX, screenY} = event;
                browser.newWindow(screenX - 50, screenY - 50, { defaultSource: this.#webview.src });
            }
        }
        return tab;
    }

    edit() {
        this.#tab.classList.add('edit');
        let textbar = this.#tab.getElementsByTagName('input')[0];
        textbar.focus();
        textbar.value = this.#webview.src;
        this.#tab.onkeydown = event => {
            if (event.key === 'Enter') {
                this.navigate(textbar.value);
            }
        }
    }

    select() { //Select one, deselect all
        this.#tab.classList.add('select');
        this.#webview.style.display = 'flex';

        let tabs = document.querySelectorAll(`#tabs button:not(#tab-${this.#id}):not(#new)`);
        for (const tab of tabs) {
            tab.webtab.deselect();
        }
    }

    get isSelected() {
        return this.#tab.classList.contains('select');
    }

    get bounds() {
        let bounds = this.#tab.getBoundingClientRect();
        return {x:bounds.x, y:bounds.y};
    }

    deselect() { //Deselect one
        this.#tab.classList.remove('select');
        this.#webview.style.display = 'none';
    }

    navigate(src) {
        //TODO: check route protocol etc
        this.#webview.src = src;
        this.#webview.focus();
    }

    close() {
        if (this.isSelected) {
            let tab = (this.#tab.previousSibling.webtab ? this.#tab.previousSibling.webtab : this.#tab.nextSibling.webtab);
            if (tab) tab.select();
        }
        this.#webview.remove();
        this.#tab.remove();
    }

    get history() {
        return this.#savedhistory;
    }

    back() {
        this.#webview.goBack();
    }

    forward() {
        this.#webview.goForward();
    }

    showOptions() {
        tabOptions.show(this);
    }
    
    #getContextCommands(event) {
        const mainActions = {};
        for (const edit of Object.entries(event.params.editFlags)) {
            const name = edit[0].substring(3);
            if(edit[1]) {
                const action = _ => {
                    this.#webview.focus();
                    this.#webview[name[0].toLowerCase() + name.slice(1)]();
                }
                mainActions[Array.from(name).map(s => s == s.toUpperCase() ? ' ' + s : s).join('').trim()] = action;
            }
        }
        return [
            mainActions,
            {Back: this.back.bind(this), Forward: this.forward.bind(this)}
        ];
    }
}