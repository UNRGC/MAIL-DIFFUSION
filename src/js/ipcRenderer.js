// Importa módulos necesarios
const { ipcRenderer } = require("electron");
const output = document.getElementById("output");

// Escuchar la salida de la API desde el proceso principal
ipcRenderer.on("api-output", (event, data) => {
    // Crear un nuevo div para cada mensaje
    const messageElement = document.createElement("div");

    // Asegurarse de que el contenido del div sea solo el mensaje recibido
    messageElement.textContent = data;

    // Asignar clases según el contenido del mensaje
    if (data.includes("Error:")) messageElement.classList.add("error");
    else if (data.includes("Conectado") || data.includes("éxito")) messageElement.classList.add("success");
    else if (data.includes("Creando")) messageElement.classList.add("warning");

    // Agregar el nuevo div al contenedor de salida
    output.appendChild(messageElement);
});
