import { getTemplates } from "../config/template.js";

const getTemplatesHandler = async (req, res) => {
    try {
        const templates = await getTemplates();
        res.status(200).send(templates);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export default getTemplatesHandler;
