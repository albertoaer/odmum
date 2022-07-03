import specialTab from "./SpecialTab.js";

window.onload = () => {
    if (browser.state.newTab)
        specialTab.createTab(browser.state.newTab);
};