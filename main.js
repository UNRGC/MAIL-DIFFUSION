import { app, BrowserWindow } from "electron";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Obtener el nombre de archivo y el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Establecer el nombre de la aplicación
app.setName("OmniMail");

// Definir la ventana principal
let mainWindow = null;

// Crear la ventana principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            // skipcq: JS-S1019
            nodeIntegration: true,
            // skipcq: JS-S1020
            contextIsolation: false,
        },
        icon: path.join(__dirname, "assets", "icon.png"),
    });

    // Deshabilitar la barra de menú
    mainWindow.setMenu(null);

    // Cargar el HTML de la interfaz
    mainWindow.loadFile("index.html");

    // Abre las herramientas de desarrollo
    //mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    // Ejecutar tu API en un proceso hijo
    const apiProcess = spawn("node", [path.join(__dirname, "api", "server.js")]);

    // Función para obtener la hora actual
    const getCurrentTime = () => {
        const now = new Date();
        const time = now.toLocaleTimeString("es-MX");
        return `${time}`;
    };

    // Capturar la salida de la API y enviarla a la ventana con la hora
    apiProcess.stdout.on("data", (data) => {
        const timestamp = getCurrentTime();
        const messages = data.toString().split("\n");
        messages.forEach((message) => {
            if (message.trim() !== "") {
                mainWindow.webContents.send("api-output", `[${timestamp}] ${message}`);
            }
        });
    });

    // Capturar los errores de la API y enviarlos a la ventana con la hora
    apiProcess.stderr.on("data", (data) => {
        const timestamp = getCurrentTime();
        const messages = data.toString().split("\n");
        messages.forEach((message) => {
            if (message.trim() !== "") {
                mainWindow.webContents.send("api-output", `[${timestamp}] Error: ${message}`);
            }
        });
    });

    // Manejar el cierre de la ventana
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
});

// Crear la ventana cuando se active la aplicación
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
