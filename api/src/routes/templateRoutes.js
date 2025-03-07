import express from "express";
import getTemplatesHandler from "../controls/templateControls.js";

const router = express.Router();

// Ruta para obtener las plantillas
router.get("/", getTemplatesHandler);

export default router;
