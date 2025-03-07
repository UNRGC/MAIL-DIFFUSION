// Importa el módulo dotenv para cargar variables de entorno desde un archivo .env
import { config } from "dotenv";
// Importa la función createTransport de nodemailer para crear un transporte de correo
import { createTransport } from "nodemailer";
// Importa el módulo fs para trabajar con el sistema de archivos
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga las variables de entorno desde el archivo .env
config();

// Configura el transporte (puedes usar Gmail, Outlook, o un servidor SMTP propio)
const transporter = createTransport({
    host: process.env.SERVER_EMAIL, // Servidor SMTP
    port: 465, // Puerto SMTP seguro
    secure: true, // Utiliza SSL/TLS
    auth: {
        user: process.env.USER_EMAIL, // Usuario de autenticación
        pass: process.env.PASSWORD_EMAIL, // Contraseña de autenticación
    },
    tls: {
        rejectUnauthorized: false, // Permite certificados no autorizados (útil para desarrollo)
    },
});

// Crea una función para enviar correos
const sendMail = async (addressee, affair, htmlBody, image) => {
    // Decodificar Base64 y guardarlo temporalmente
    const base64Data = image.replace(/^data:image\/\w+;base64,/, ""); // Elimina el prefijo de la cadena Base64
    const buffer = Buffer.from(base64Data, "base64"); // Convierte la cadena Base64 en un buffer
    const filePath = path.join(__dirname, "../uploads", "temp_image.jpg"); // Ruta del archivo temporal
    fs.writeFileSync(filePath, buffer); // Escribe el buffer en un archivo

    // Configura las opciones del correo
    const mailOptions = {
        from: `"${process.env.ORGANIZATION}" <${process.env.USER_EMAIL}>`, // Remitente
        to: addressee, // Destinatario(s)
        subject: affair, // Asunto del correo
        html: htmlBody, // Cuerpo del correo en HTML
        attachments: [
            {
                filename: "imagen.jpg", // Nombre del archivo adjunto
                path: filePath, // Ruta del archivo adjunto
                cid: "uploadedImage", // ID del contenido para referenciar en el HTML
            },
        ],
    };

    try {
        // Envía el correo utilizando el transporte configurado
        const info = await transporter.sendMail(mailOptions);
        // fs.unlinkSync(filePath); // Elimina el archivo temporal (comentado para depuración)
        console.debug("Correo enviado: %s", info.messageId); // Mensaje de éxito en la consola
    } catch (error) {
        console.error("Error enviando el correo:", error.message); // Maneja errores y muestra un mensaje en la consola
    }
};

// Exporta la función sendMail como la exportación predeterminada del módulo
export default sendMail;
