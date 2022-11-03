const { contextBridge, ipcRenderer } = require('electron');

ipcRenderer.invoke('config').then(configuration => {
    contextBridge.exposeInMainWorld('browser', {
        id: configuration.id,
        state: configuration.state,
        activeConfiguration: configuration.activeConfiguration,
        styles: configuration.styles,
        close: () => ipcRenderer.send('close'),
        maximize: () => ipcRenderer.send('maximize'),
        minimize: () => ipcRenderer.send('minimize'),
        newWindow: (x, y, newTab) => ipcRenderer.send('newWindow', x, y, newTab)
    });
});