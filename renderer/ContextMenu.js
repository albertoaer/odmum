export class ContextMenu {
    #view;

    constructor() {
        this.#view = document.getElementById('context');
        this.#view.tabIndex = -1;
        this.#view.onblur = _ => this.#view.classList.add('hidden');
    }

    show(commands, location) {
        this.#view.innerHTML = '';
        for (const cmdlist in commands) {
            for (const cmd of Object.entries(commands[cmdlist])) {
                const elem = this.#view.appendChild(document.createElement('li'));
                elem.innerText = cmd[0];
                elem.onclick = () => {
                    cmd[1]();
                    this.#view.blur();
                }
            }
            if (cmdlist < commands.length-1) {
                this.#view.appendChild(document.createElement('hr'));
            }
        }

        this.#view.classList.remove('hidden');
        this.#view.style.left = `${document.body.clientWidth - location.x < this.#view.clientWidth
            ? location.x - this.#view.clientWidth : location.x}px`;
        this.#view.style.top = `${document.body.clientHeight - location.y < this.#view.clientHeight
            ? location.y - this.#view.clientHeight : location.y}px`;
        this.#view.focus();
    }
}

export default new ContextMenu();