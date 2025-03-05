// Importa módulos necesarios
const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

// Obtiene referencias a elementos del DOM
const connectionBtn = document.getElementById("connection");
const consoleBtn = document.getElementById("console");
const diffusionBtn = document.getElementById("diffusion");
const exitBtn = document.getElementById("exitBtn");

const connectionSection = document.querySelector(".connection");
const consoleSection = document.querySelector(".console");
const diffusionSection = document.querySelector(".diffusion");
const resultSection = document.querySelector(".result");
const discardBtn = document.getElementById("discard");
const saveBtn = document.getElementById("save");
const advancedBtn = document.getElementById("advanced");
const discardBtnDiffusion = document.getElementById("discardDiffusion");

const instanceInput = document.getElementById("instance");
const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");
const dbNameLabel = document.getElementById("dbNameLabel");
const dbNameInput = document.getElementById("dbName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const hostLabel = document.getElementById("hostLabel");
const hostInput = document.getElementById("host");
const organizationLabel = document.getElementById("organizationLabel");
const organizationInput = document.getElementById("organization");

const formDiffusion = document.getElementById("formDiffusion");

const affairInput = document.getElementById("affair");
const messageInput = document.getElementById("message");
const templateSelect = document.getElementById("template");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const span = document.getElementById("placeholder");
const returnBtn = document.getElementById("return");

let hash = window.location.hash || "#console";
let estado = "listo";

// Función para manejar cambios en el hash de la URL
const hashChange = () => {
    hash = window.location.hash;

    // Resetea clases y secciones
    connectionBtn.classList.remove("active");
    consoleBtn.classList.remove("active");
    diffusionBtn.classList.remove("active");
    exitBtn.classList.remove("active");

    connectionSection.classList.add("hidden");
    consoleSection.classList.add("hidden");
    diffusionSection.classList.add("hidden");
    resultSection.classList.add("hidden");

    discardBtn.disabled = true;
    advancedBtn.disabled = true;
    saveBtn.disabled = true;

    // Muestra la sección correspondiente según el hash
    if (estado === "listo") {
        if (hash === "#connection") {
            connectionBtn.classList.add("active");
            connectionSection.classList.remove("hidden");
        } else if (hash === "#console") {
            consoleBtn.classList.add("active");
            consoleSection.classList.remove("hidden");
        } else if (hash === "#diffusion") {
            diffusionBtn.classList.add("active");
            diffusionSection.classList.remove("hidden");
        } else if (hash === "#result") {
            diffusionBtn.classList.add("active");
            resultSection.classList.remove("hidden");
        } else if (hash === "#exit") window.close();
    } else {
        diffusionBtn.classList.add("active");
        resultSection.classList.remove("hidden");
        document.body.classList.add("wait");
    }
};

// Función para obtener la configuración de conexión desde el servidor
const getConnection = async () => {
    const response = await fetch("http://localhost:3000/env", {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.json();
};

// Función para enviar la configuración de conexión al servidor
const sendConnection = async (data) => {
    const response = await fetch("http://localhost:3000/env", {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

// Función para obtener todas las direcciones de correo electrónico desde el servidor
const getAllEmailAddresses = async () => {
    const response = await fetch("http://localhost:3000/email", {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.json();
};

// Función para enviar un correo electrónico a través del servidor
const sendMail = async (data) => {
    const response = await fetch("http://localhost:3000/email/send", {
        mode: "cors",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

// Función para cargar la configuración de conexión en los campos del formulario
const loadConnection = async () => {
    const envVariables = await getConnection();

    instanceInput.value = envVariables.DB_SERVER;
    userInput.value = envVariables.DB_USER;
    passInput.value = "";
    if (envVariables.DB_USER !== "") passInput.placeholder = "••••••••";
    dbNameInput.value = envVariables.DB_NAME;

    emailInput.value = envVariables.USER_EMAIL;
    passwordInput.value = "";
    if (envVariables.USER_EMAIL !== "") passwordInput.placeholder = "••••••••";
    hostInput.value = envVariables.SERVER_EMAIL;
    organizationInput.value = envVariables.ORGANIZATION;
};

// Escuchar la salida de la API desde el proceso principal
ipcRenderer.on("api-output", (event, data) => {
    const outputElement = document.getElementById("output");
    const messageElement = document.createElement("div");
    messageElement.textContent = data;
    if (data.includes("Error:")) messageElement.classList.add("error");
    else if (data.includes("Conectado") || data.includes("éxito")) messageElement.classList.add("success");
    else if (data.includes("Creando")) messageElement.classList.add("warning");

    outputElement.appendChild(messageElement);
});

// Manejar cambios en el hash de la URL
window.addEventListener("hashchange", () => {
    hashChange();
});

// Manejar el envío del formulario de conexión
document.getElementById("formConnection").addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
        instance: instanceInput.value,
        user: userInput.value,
        pass: passInput.value,
        dbName: dbNameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        host: hostInput.value,
        organization: organizationInput.value,
    };

    try {
        const response = await sendConnection(data);

        if (response.message.includes("éxito")) {
            alert(`${response.message}, reinicie la aplicación para aplicar los cambios`);
            window.location.hash = "console";
        } else {
            window.location.hash = "console";
            ipcRenderer.send("api-input", response.message);
        }
    } catch (error) {
        ipcRenderer.send("api-input", error.message);
        console.debug(error);
    }
});

// Manejar el envío del formulario de difusión
formDiffusion.addEventListener("submit", async (event) => {
    event.preventDefault();

    const table = document.getElementById("tbody");
    const formData = {
        affair: affairInput.value,
        message: messageInput.value,
        template: templateSelect.value,
        image: preview.src,
    };

    estado = "enviando";
    window.location.hash = "result";

    try {
        const addresses = await getAllEmailAddresses();
        const uniqueEmails = new Set();

        table.innerHTML = "";

        addresses.forEach((address) => {
            const tr = document.createElement("tr");
            const td1 = document.createElement("td");
            td1.textContent = address.name;
            const td2 = document.createElement("td");
            const filteredEmails = address.emails.split(",").filter((email) => {
                const trimmedEmail = email.trim();
                return trimmedEmail !== "" && trimmedEmail !== "g.floreso@hotmail.com" && trimmedEmail !== "s.espinozas@hotmail.com" && trimmedEmail !== "sespinozasolis@gmail.com" && trimmedEmail !== "facturas.mercasoft@hotmail.com" && !uniqueEmails.has(trimmedEmail);
            });

            filteredEmails.forEach((email) => uniqueEmails.add(email.trim()));

            td2.textContent = filteredEmails.join(", ");
            const td3 = document.createElement("td");
            td3.textContent = "Enviando...";

            if (td2.textContent !== "") {
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                document.getElementById("tbody").appendChild(tr);
            }
        });
    } catch (error) {
        ipcRenderer.send("api-input", error.message);
        window.location.hash = "console";
        estado = "listo";
        return;
    }

    Promise.all(
        Array.from(table.querySelectorAll("tr")).map(async (tr) => {
            const tds = tr.querySelectorAll("td");
            const emails = tds[1].textContent;
            const status = tds[2];

            const data = {
                addressee: emails,
                affair: formData.affair,
                message: formData.message,
                template: formData.template,
                image: formData.image,
            };

            try {
                await sendMail(data).then((response) => {
                    if (response.message.includes("enviado")) status.textContent = "Enviado";
                    else status.textContent = "Error";
                });
            } catch (error) {
                ipcRenderer.send("api-input", error.message);
                status.textContent = "Error";
            }
        })
    ).then(() => {
        returnBtn.disabled = false;
        document.body.classList.remove("wait");
    });
});

// Habilitar botones cuando los campos de entrada obtienen el foco
const enableButtonsOnFocus = (inputElement) => {
    inputElement.addEventListener("focus", () => {
        discardBtn.disabled = false;
        advancedBtn.disabled = false;
        saveBtn.disabled = false;
    });
};

enableButtonsOnFocus(instanceInput);
enableButtonsOnFocus(userInput);
enableButtonsOnFocus(emailInput);
enableButtonsOnFocus(passInput);
enableButtonsOnFocus(passwordInput);

// Manejar el cambio de placeholder en los campos de contraseña
const handlePasswordPlaceholder = (inputElement) => {
    inputElement.addEventListener("focus", () => {
        if (inputElement.placeholder === "••••••••") inputElement.placeholder = "";
    });

    inputElement.addEventListener("blur", () => {
        if (inputElement.placeholder === "") inputElement.placeholder = "••••••••";
    });
};

handlePasswordPlaceholder(passInput);
handlePasswordPlaceholder(passwordInput);

// Manejar el clic en el botón de descartar
discardBtn.addEventListener("click", () => {
    loadConnection();

    dbNameLabel.classList.add("hidden");
    dbNameInput.classList.add("hidden");
    hostLabel.classList.add("hidden");
    hostInput.classList.add("hidden");
    organizationLabel.classList.add("hidden");
    organizationInput.classList.add("hidden");

    discardBtn.disabled = true;
    advancedBtn.disabled = true;
    saveBtn.disabled = true;
});

// Manejar el clic en el botón de opciones avanzadas
advancedBtn.addEventListener("click", () => {
    dbNameLabel.classList.remove("hidden");
    dbNameInput.classList.remove("hidden");
    hostLabel.classList.remove("hidden");
    hostInput.classList.remove("hidden");
    organizationLabel.classList.remove("hidden");
    organizationInput.classList.remove("hidden");
});

// Manejar el clic en el botón de descartar difusión
discardBtnDiffusion.addEventListener("click", () => {
    preview.src = "static/placeholder.png";
    preview.style.height = "46px";
    span.classList.remove("hidden");
});

// Manejar el clic en el botón de retorno
returnBtn.addEventListener("click", () => {
    estado = "listo";
    formDiffusion.reset();
    preview.src = "static/placeholder.png";
    preview.style.height = "46px";
    window.location.hash = "diffusion";
    returnBtn.disabled = true;
});

// Manejar el clic en el botón de limpiar consola
document.getElementById("clearConsole").addEventListener("click", () => {
    document.getElementById("output").textContent = "";
});

// Manejar el clic en la vista previa de la imagen
preview.addEventListener("click", () => imageInput.click());
span.addEventListener("click", () => imageInput.click());

// Manejar el cambio de archivo de imagen
imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => (preview.src = e.target.result);
        reader.readAsDataURL(file);
        span.classList.add("hidden");
        preview.style.height = "auto";
    }
});

// Inicializar el hash y cargar la configuración
window.location.hash = hash;
hashChange();

// Función para cargar archivos HTML en el selector de plantillas
const loadHtmlFiles = () => {
    const directoryPath = path.join(__dirname, "static");
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error("No se pudo leer el directorio:", err);
            return;
        }
        const htmlFiles = files.filter((file) => path.extname(file) === ".html");
        htmlFiles.forEach((file) => {
            const option = document.createElement("option");
            option.value = file;
            option.textContent = file;
            templateSelect.appendChild(option);
        });
    });
};

// Cargar la configuración de conexión y los archivos HTML
loadConnection();
loadHtmlFiles();
