import express from "express";
import cors from "cors";
import envRoutes from "./src/routes/envRoutes.js";
import emailRoutes from "./src/routes/emailRoutes.js";
import templateRoutes from "./src/routes/templateRoutes.js";
import { connectDB } from "./src/config/db.js";
import os from "os";
import { newEnv } from "./src/config/env.js";
import { newTemplate } from "./src/config/template.js";

// Crear la aplicación Express
const app = express();

// Crear las variables de entorno
newEnv();

// Crea la primer plantilla
newTemplate();

// Conectar a la base de datos
await connectDB();

// Configurar Express para que pueda parsear JSON
app.use(express.json({ limit: "25mb" }));

// Configuración CORS
const corsOptions = {
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));

// Middleware para manejar errores de JSON mal formados
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        console.error("Error de JSON mal formado:", err.message);
        res.status(400).json({ message: "JSON mal formado" });
        return;
    }
    next();
});

// Rutas
app.use("/env", envRoutes);
app.use("/email", emailRoutes);
app.use("/template", templateRoutes);

// Obtener la dirección IP de la máquina
const getIPAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "localhost";
};

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const ipAddress = getIPAddress();
    console.debug(`Servidor iniciado en ${ipAddress}:${PORT}`);
});
