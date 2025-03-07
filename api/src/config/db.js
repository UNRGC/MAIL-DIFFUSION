import sql from "mssql";
import { config } from "dotenv";

config(); // Cargar variables de entorno

// Configuración de la conexión
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Necesario si usas Azure
        trustServerCertificate: true, // Para evitar problemas con certificados
    },
};

// Crear un pool de conexiones
export const pool = new sql.ConnectionPool(dbConfig);

// Función para conectar a la base de datos
export const connectDB = async () => {
    try {
        await pool.connect();
        console.debug(`Conectado a la base de datos ${process.env.DB_NAME}`);
    } catch (error) {
        console.error("No se pudo conectar a la base de datos, ", error.message);
    }
};
