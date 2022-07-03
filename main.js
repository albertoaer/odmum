const {app, BrowserWindow, ipcMain, session, globalShortcut} = require('electron');
const path = require('path');
const activeConfiguration = require('./config.json');

for (const swt of Object.entries(activeConfiguration.switches)) { //Chromium configuration
    let values = Array.isArray(swt[1]) ? swt[1] : [swt[1]];
    for (const value of values) {
        app.commandLine.appendSwitch(swt[0], value);
    }
}

function createWindow(x=undefined, y=undefined, newTab={}) {
    const window = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true
        },
        show: false,
        frame: false,
        x,
        y
    });
    window.setMenu(null);
    window.loadFile('index.html');
    window.once('ready-to-show', () => window.show());
    ipcMain.handleOnce('config', _ => {
        return {id:window.id, state:{newTab}, activeConfiguration};
    });
}

function setUpShortcuts() {
    const windowByEvent = event => BrowserWindow.fromWebContents(event.sender);

    ipcMain.on('close', event => windowByEvent(event).close());
    ipcMain.on('maximize', event => windowByEvent(event).isMaximized() ? windowByEvent(event).unmaximize() : windowByEvent(event).maximize());
    ipcMain.on('minimize', event => windowByEvent(event).minimize());
    ipcMain.on('newWindow', (_, x, y, newTab) => createWindow(x, y, newTab));

    const window = () => BrowserWindow.getFocusedWindow();

    if (process.defaultApp) { //load default functionality
        globalShortcut.register('f5', () => window().webContents.reload());
        globalShortcut.register('f6', () => window().webContents.isDevToolsOpened() ?
            window().webContents.closeDevTools() : window().webContents.openDevTools()
        );
    }
}

app.on('ready', () => {
    setUpShortcuts();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
})

app.on('web-contents-created', (_, contents) => {
    if (contents.getType() === 'webview')
        contents.on('new-window', event => event.preventDefault());
});

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') app.quit();
})

//Clear all storaged data
app.on('quit', async () => await session.defaultSession.clearStorageData())