import getAllEmailAddresses from "../models/emailAddressModel.js";

const getAllEmailAddressesHandler = async (req, res) => {
    try {
        // Obtener direcciones de correo
        const emailAddresses = await getAllEmailAddresses();

        // Enviar respuesta
        res.status(200).json(emailAddresses);
    } catch (error) {
        // Manejo de errores
        console.error("No se obtuvieron las direcciones de correo, ", error.message);
        res.status(500).send(error.message);
    }
};

export default getAllEmailAddressesHandler;
