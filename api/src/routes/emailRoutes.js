import express from "express";
import getAllEmailAddressesHandler from "../controls/emailAddressControls.js";
import { sendMailHandler } from "../controls/emailControls.js";

const emailRouter = express.Router();

// Ruta para obtener direcciones de correo
emailRouter.get("/", getAllEmailAddressesHandler);
// Ruta para enviar correos
emailRouter.post("/send", sendMailHandler);

export default emailRouter;
