export class TabOptions {
    #view;
    #currentTarget;

    constructor() {
        this.#view = document.getElementById('options');
        this.#view.tabIndex = -1;
        const checkHide = _ => {
            setTimeout(_ => {
                if (!this.#view.contains(document.activeElement)) {
                    this.#view.classList.add('hidden');
                }
            }, 100);
        }
        const recursiveApply = child => {
            child.onblur = checkHide;
            for (const c of child.children) {
                recursiveApply(c);
            }
        }
        recursiveApply(this.#view);
        this.#view.querySelector('.go.back').onclick = _ => this.#currentTarget.back();
        this.#view.querySelector('.go.forward').onclick = _ => this.#currentTarget.forward();
    }

    show(target) {
        this.#currentTarget = target;
        this.#view.classList.remove('hidden');
        this.#view.focus();
        this.#view.style.left = `${target.bounds.x}px`;
        let behave = setInterval(() => {
            this.#view.style.left = `${target.bounds.x}px`;
            if (this.#currentTarget != target)
                clearInterval(behave);
        }, 10);
    }
}

export default new TabOptions();