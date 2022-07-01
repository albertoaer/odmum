const { contextBridge, ipcRenderer } = require('electron');
const { readFileSync } = require('fs');
const activeConfiguration = require('./config.json');
const styles = readFileSync('./webview_style.css').toString('utf8');


contextBridge.exposeInMainWorld('browser', {
    activeConfiguration,
    styles,
    close: () => ipcRenderer.send('close'),
    maximize: () => ipcRenderer.send('maximize'),
    minimize: () => ipcRenderer.send('minimize'),
    newWindow: (x,y) => ipcRenderer.send('newWindow', x, y)
});