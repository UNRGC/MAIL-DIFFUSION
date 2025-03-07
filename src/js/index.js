import { getConnection, sendConnection, getAllEmailAddresses, sendMail, getTemplates } from "./api.js";

// Obtiene referencias a elementos del DOM
const connectionBtn = document.getElementById("connection");
const consoleBtn = document.getElementById("console");
const diffusionBtn = document.getElementById("diffusion");
const exitBtn = document.getElementById("exitBtn");

const connectionSection = document.querySelector(".connection");
const consoleSection = document.querySelector(".console");
const diffusionSection = document.querySelector(".diffusion");
const resultSection = document.querySelector(".result");

const formConnection = document.getElementById("formConnection");
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

const discardBtn = document.getElementById("discard");
const saveBtn = document.getElementById("save");
const advancedBtn = document.getElementById("advanced");

const output = document.getElementById("output");
const clearBtn = document.getElementById("clear");

const formDiffusion = document.getElementById("formDiffusion");
const affairInput = document.getElementById("affair");
const colorInput = document.getElementById("color");
const messageInput = document.getElementById("message");
const templateSelect = document.getElementById("template");
const imageInput = document.getElementById("imageInput");
const placeholderInput = document.getElementById("placeholder");
const preview = document.getElementById("preview");
const cancelBtn = document.getElementById("cancel");

const tbody = document.getElementById("tbody");
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

    discardBtn.click();

    // Muestra la sección correspondiente según el hash
    if (hash === "#connection") {
        connectionBtn.classList.add("active");
        connectionSection.classList.remove("hidden");
    } else if (hash === "#console") {
        consoleBtn.classList.add("active");
        consoleSection.classList.remove("hidden");
    } else if (hash === "#diffusion" && estado === "listo") {
        diffusionBtn.classList.add("active");
        diffusionSection.classList.remove("hidden");
    } else if (hash === "#diffusion" && estado === "enviando") {
        window.location.hash = "result";
    } else if (hash === "#result") {
        diffusionBtn.classList.add("active");
        resultSection.classList.remove("hidden");
    } else if (hash === "#exit") window.close();
};

// Función para cargar la configuración de conexión en los campos del formulario
const loadConnection = async () => {
    if (sessionStorage.getItem("connection") === true) return;

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
    sessionStorage.setItem("connection", "true");
};

const loadTemplates = async () => {
    const templates = await getTemplates();

    templates.forEach((template) => {
        const option = document.createElement("option");
        option.value = template.fileName;
        option.textContent = template.fileName;
        templateSelect.appendChild(option);
    });
};

// Manejar cambios en el hash de la URL
window.addEventListener("hashchange", () => {
    hashChange();
});

// Manejar el envío del formulario de conexión
formConnection.addEventListener("submit", async (event) => {
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
        }
    } catch (error) {
        console.debug(error);
    }
});

// Manejar el envío del formulario de difusión
formDiffusion.addEventListener("submit", async (event) => {
    event.preventDefault();
    document.body.classList.add("wait");

    const formData = {
        affair: affairInput.value,
        color: colorInput.value,
        message: messageInput.value,
        template: templateSelect.value,
        image: preview.src,
    };

    estado = "enviando";
    window.location.hash = "result";

    try {
        const addresses = await getAllEmailAddresses();
        const uniqueEmails = new Set();

        tbody.innerHTML = "";

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
                tbody.appendChild(tr);
            }
        });

        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.textContent = organizationInput.value;
        const td2 = document.createElement("td");
        td2.textContent = emailInput.value;
        const td3 = document.createElement("td");
        td3.textContent = "Enviando...";
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tbody.appendChild(tr);
    } catch (error) {
        window.location.hash = "console";
        estado = "listo";
        return;
    }

    Promise.all(
        Array.from(tbody.querySelectorAll("tr")).map(async (tr) => {
            const tds = tr.querySelectorAll("td");
            const emails = tds[1].textContent;
            const status = tds[2];

            const data = {
                addressee: emails,
                affair: formData.affair,
                color: formData.color,
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
cancelBtn.addEventListener("click", () => {
    preview.src = "src/img/placeholder.png";
    preview.style.height = "46px";
    placeholderInput.classList.remove("hidden");
});

// Manejar el clic en el botón de retorno
returnBtn.addEventListener("click", () => {
    estado = "listo";
    cancelBtn.click();
    window.location.hash = "diffusion";
    returnBtn.disabled = true;
});

// Manejar el clic en el botón de limpiar consola
clearBtn.addEventListener("click", () => {
    output.textContent = "";
});

// Manejar el clic en la vista previa de la imagen
preview.addEventListener("click", () => imageInput.click());
placeholderInput.addEventListener("click", () => imageInput.click());

// Manejar el cambio de archivo de imagen
imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => (preview.src = e.target.result);
        reader.readAsDataURL(file);
        placeholderInput.classList.add("hidden");
        preview.style.height = "auto";
    }
});

// Inicializar el hash y cargar la configuración
window.location.hash = hash;
hashChange();

// Cargar la configuración de conexión y los archivos HTML
loadConnection();
loadTemplates();
