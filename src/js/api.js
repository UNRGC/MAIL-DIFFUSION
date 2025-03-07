// Función para obtener la configuración de conexión desde el servidor
export const getConnection = async () => {
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
export const sendConnection = async (data) => {
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
export const getAllEmailAddresses = async () => {
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
export const sendMail = async (data) => {
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

// Función para obtener todas las plantillas de correo electrónico desde el servidor
export const getTemplates = async () => {
    const response = await fetch("http://localhost:3000/template", {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.json();
};
