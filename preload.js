const { contextBridge, ipcRenderer } = require('electron');
const { readFileSync } = require('fs');
const styles = readFileSync('./webview_style.css').toString('utf8');

ipcRenderer.invoke('config').then(configuration => {
    contextBridge.exposeInMainWorld('browser', {
        id: configuration.id,
        state: configuration.state,
        activeConfiguration: configuration.activeConfiguration,
        styles,
        close: () => ipcRenderer.send('close'),
        maximize: () => ipcRenderer.send('maximize'),
        minimize: () => ipcRenderer.send('minimize'),
        newWindow: (x, y, newTab) => ipcRenderer.send('newWindow', x, y, newTab)
    });
});