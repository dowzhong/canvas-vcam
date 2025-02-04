const SCALE = 0.75;
// const SCALE = 1;
const { app, BrowserWindow, Menu, Tray } = require("electron");
const input = require("./input");
const hats = ["none", "top hat", "fedora", "shroom", "crown", "harry"];
let win, tray;

function createWindow() {
    win = new BrowserWindow({
        width: Math.round(600 * SCALE),
        height: Math.round(400 * SCALE),
        // x: 0, y: 0,
        x: 6, y: 145,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        frame: false,
        transparent: true,
        alwaysOnTop: true
    });

    // win.setIgnoreMouseEvents(true);

    function attachSend(event) {
        return (...args) => {
            try {
                win.webContents.send(event, ...args);
            } catch(e) {
                console.log("could not send IPC to window " + String(e));
            }
        };
    }

    win.loadFile("window/cam.htm", {
        query: {
            scale: SCALE,
            hats: hats.join(";")
        }
    });

    for(const eventName of Object.values(keys)) {
        const handler = attachSend(eventName);
        input.on(eventName, handler);
        win.on("closed", () => {
            input.off(eventName, handler);
        });
    }
}

function clickHat(event) {
    const hat_index = hats.indexOf(event.label);
    win.webContents.send("hat", hat_index);
}

function createTrayIcon() {
    const contextMenu = Menu.buildFromTemplate(
        hats.map(name => ({ label: name, type: "radio", click: clickHat }))
    );

    tray = new Tray(__dirname + "/../icon.png");
    tray.setToolTip("streamcam")
    tray.setContextMenu(contextMenu);
}

function initialize() {
    createWindow();
    createTrayIcon();
}

app.whenReady().then(initialize);

app.on("window-all-closed", () => {
    app.quit();
});

app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
