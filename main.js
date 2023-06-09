const path = require('path');
const {app, BrowserWindow, Menu } = require('electron');

const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform === 'darwin';

//Create main window
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 800,
        height: 600,
        webPreferences: {
            nodeIntegration:true
        }
    });

    //open dev tools if in dev environment
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

//App is ready
app.whenReady().then(() => {
    createMainWindow();

    //Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow()
        }
      })
});

//Menu template
const menu = [
    {
        role: 'fileMenu',
    }
]

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});