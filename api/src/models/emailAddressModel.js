import { pool } from "../config/db.js";

const getAllEmailAddresses = async () => {
    try {
        // Definir la consulta SQL
        const query = "SELECT CRAZONSOCIAL AS name, CONCAT(CEMAIL1, ', ', CEMAIL2, ', ', CEMAIL3) AS emails FROM admClientes WHERE CRAZONSOCIAL != '(Ninguno)' ORDER BY CRAZONSOCIAL ASC;";

        // Ejecutar la consulta
        const result = await pool.request().query(query);

        // Devolver los resultados de la consulta
        return result.recordset;
    } catch (error) {
        // Manejo de errores
        console.error("Error al obtener direcciones de correo:", error.message);
        throw error;
    }
};

export default getAllEmailAddresses;
