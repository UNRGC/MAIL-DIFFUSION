// Importa la función sendMail desde el modelo emailModel.js
import sendMail from "../models/emailModel.js";
// Importa módulos fs y path para trabajar con el sistema de archivos y rutas
import fs from "fs";
import path from "path";
// Importa fileURLToPath para trabajar con URLs de archivos
import { fileURLToPath } from "url";

// Obtiene el nombre del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Controlador para manejar el envío de correos electrónicos
export const sendMailHandler = async (req, res) => {
    try {
        // Extrae los datos del cuerpo de la solicitud
        const { addressee, affair, color, message, template, image } = req.body;

        // Construye la ruta al archivo de plantilla HTML
        const templatePath = path.join(__dirname, "../templates", template);

        let html = "";

        // Lee el contenido del archivo de plantilla HTML
        html = fs.readFileSync(templatePath, "utf8");

        // Reemplazos a realizar en el contenido HTML
        const replacements = {
            _color: color,
            _affair: affair,
            _message: message,
        };

        // Reemplaza las palabras o frases en el contenido HTML
        for (const [key, value] of Object.entries(replacements)) {
            const regex = new RegExp(key, "g");
            html = html.replace(regex, value);
        }

        // Envía el correo electrónico utilizando la función sendMail
        await sendMail(addressee, affair, html, image);

        // Responde con un mensaje de éxito
        res.status(200).json({ message: "Correo enviado." });
    } catch (error) {
        // Maneja errores y responde con un mensaje de error
        console.error("No se pudo enviar el correo, ", error.message);
        res.status(500).json({ message: "Error." });
    }
};
