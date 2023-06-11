const path = require('path');
const os = require('os');
const fs = require('fs');
const sharp = require('sharp');
const resizeImg = require('resize-img');
const {app, BrowserWindow, Menu, ipcMain, shell } = require('electron');


process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

//Create main window
function createMainWindow() {
     mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    //open dev tools if in dev environment
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));

    
}

//Create about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300,
        webPreferences: {
            nodeIntegration:true
        },
        resizable: false,
    });

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

//App is ready
app.whenReady().then(() => {
    createMainWindow();

    //Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    //Remove main window on close
    mainWindow.on('closed', () => mainWindow = null);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow()
        }
      })
});

//Menu template
const menu = [
    ...(isMac ? [{ 
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac ?[{
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : [])
]

//Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'Image_Resizer');
    resizeImage(options);
    
});

// Resize image
async function resizeImage({ imgPath, width, height, brightness, dest }) {
    try {
      const image = sharp(imgPath);
  
      // Resize the image
      image.resize({ width: +width, height: +height });
  
      // Extract the numeric value from brightness string
      const brightnessValue = brightness.match(/\d+/);
      const brightnessNumber = brightnessValue ? parseInt(brightnessValue[0]) : null;
  
      // Check if brightness is a valid number
      if (!isNaN(brightnessNumber)) {
        let adjustedBrightness = brightnessNumber / 100; // Scale between -1 and 1
        adjustedBrightness -= .5;
        
        //if adjusted brightness is negative make it 0
        if (adjustedBrightness < 0) adjustedBrightness = 0;
        image.modulate({ brightness: adjustedBrightness });
      } else {
        throw new Error('Invalid brightness value: ' + brightness);
      }
  
      // Create a file name for the resized image
      const filename = 'resized-' + path.basename(imgPath);
  
      // Save the modified image
      await image.toFile(path.join(dest, filename));
  
      // Send a success message to the renderer process
      mainWindow.webContents.send('image:done');
  
      // Open the destination folder
      shell.openPath(dest);
    } catch (err) {
      console.log(err);
    }
  }
  
  
  
app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});