import express from "express";
import { envGetHandler, envUpdateHandler } from "../controls/envControls.js";

const router = express.Router();

// Ruta para actualizar las variables de entorno
router.post("/", envUpdateHandler);
// Ruta para obtener las variables de entorno
router.get("/", envGetHandler);

export default router;
