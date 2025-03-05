// Importa el módulo dotenv para cargar variables de entorno desde un archivo .env
import { config } from "dotenv";
// Importa funciones del módulo fs para trabajar con el sistema de archivos
import { writeFileSync, existsSync, readFileSync } from "fs";

// Carga las variables de entorno desde el archivo .env
config();

// Función para crear un nuevo archivo .env con valores predeterminados si no existe
export const envNew = () => {
    const envFilePath = ".env"; // Ruta del archivo .env
    if (!existsSync(envFilePath)) {
        // Verifica si el archivo .env no existe
        // Contenido predeterminado para el archivo .env
        const envContent = `DB_SERVER=
DB_USER=sa
DB_PASSWORD=
DB_NAME=adMercasoft
USER_EMAIL=
PASSWORD_EMAIL=
SERVER_EMAIL=smtp.simercasoft.com.mx
ORGANIZATION=Soluciones Integrales Mercasoft`;

        // Escribe el contenido predeterminado en el archivo .env
        writeFileSync(envFilePath, envContent, "utf8");
        console.debug("Entorno creado con éxito"); // Mensaje de éxito en la consola
    } else {
        console.debug("Entorno cargado con éxito"); // Mensaje si el archivo .env ya existe
    }
};

// Función para actualizar el archivo .env con nuevos valores
export const envUpdate = (instance, user, pass, dbName, email, password, host, organization) => {
    const envFilePath = ".env"; // Ruta del archivo .env

    // Contenido actualizado para el archivo .env con los nuevos valores
    const envContent = `DB_SERVER=${instance}
DB_USER=${user}
DB_PASSWORD=${pass}
DB_NAME=${dbName}
USER_EMAIL=${email}
PASSWORD_EMAIL=${password}
SERVER_EMAIL=${host}
ORGANIZATION=${organization}`;

    // Escribe el contenido actualizado en el archivo .env
    writeFileSync(envFilePath, envContent, "utf8");
    console.debug("Entorno actualizado con éxito, reinicie la aplicación para aplicar los cambios"); // Mensaje de éxito en la consola
};

// Función para obtener las variables de entorno desde el archivo .env
export const envGet = () => {
    const envFilePath = ".env"; // Ruta del archivo .env
    const envContent = readFileSync(envFilePath, "utf8"); // Lee el contenido del archivo .env
    const envVariables = envContent.split("\n").map((line) => line.split("=")); // Divide el contenido en líneas y luego en pares clave-valor
    const envObject = Object.fromEntries(envVariables); // Convierte los pares clave-valor en un objeto
    const { DB_SERVER, DB_USER, USER_EMAIL, DB_NAME, SERVER_EMAIL, ORGANIZATION } = envObject; // Extrae las variables de entorno necesarias
    return { DB_SERVER, DB_USER, USER_EMAIL, DB_NAME, SERVER_EMAIL, ORGANIZATION }; // Devuelve las variables de entorno como un objeto
};
