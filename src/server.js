import express from "express";
import cors from "cors";
import envRoutes from "./routes/envRoutes.js";
import emailRouter from "./routes/emailRoutes.js";
import { connectDB } from "./config/db.js";
import os from "os";
import { envNew } from "./config/env.js";

// Crear la aplicación Express
const app = express();

// Crear las variables de entorno
envNew();

// Conectar a la base de datos
connectDB();

// Configurar Express para que pueda parsear JSON
app.use(express.json({ limit: "15mb" }));

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
app.use("/email", emailRouter);

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
