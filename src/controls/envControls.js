// Importa las funciones envGet y envUpdate desde el archivo de configuración env.js
import { envGet, envUpdate } from "../config/env.js";

// Controlador para manejar la actualización de las variables de entorno
export const envUpdateHandler = (req, res) => {
    // Extrae los datos del cuerpo de la solicitud
    const { instance, user, pass, dbName, email, password, host, organization } = req.body;
    try {
        // Actualiza las variables de entorno con los nuevos valores
        envUpdate(instance, user, pass, dbName, email, password, host, organization);
        // Responde con un mensaje de éxito
        res.json({ message: "Conexión actualizada con éxito" });
    } catch (error) {
        // Maneja errores y responde con un mensaje de error
        res.status(500).json({ message: error.message });
    }
};

// Controlador para manejar la obtención de las variables de entorno
export const envGetHandler = (req, res) => {
    try {
        // Obtiene las variables de entorno
        const envVariables = envGet();
        // Responde con las variables de entorno
        res.json(envVariables);
    } catch (error) {
        // Maneja errores y responde con un mensaje de error
        res.status(500).json({ message: error.message });
    }
};
