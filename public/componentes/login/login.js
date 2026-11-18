async function entrar() {
    const correo = document.getElementById("login-correo").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const error = document.getElementById("login-error");

    if (!correo || !password) {
        error.textContent = "Por favor, completa todos los campos.";
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const usuario = usuarios.find(u => u.correo === correo);
    const hash = await hashPassword(password);

    // mismo mensaje para ambos casos, para no revelar qué correos existen
    if (!usuario || usuario.password !== hash) {
        error.textContent = "Correo o contraseña incorrectos.";
        return;
    }

    const sesion = JSON.stringify({
        correo: usuario.correo,
        nombre: usuario.nombre,
        empresa: usuario.empresa
    });

    // "Recordarme": persiste entre cierres del navegador; si no, solo esta pestaña
    const recordar = document.getElementById("login-recordar").checked;
    (recordar ? localStorage : sessionStorage).setItem("sesion", sesion);

    mostrarSistema(usuario);
}

function mostrarSistema(usuario) {
    document.getElementById("login").classList.add("oculto");
    document.getElementById("registro").classList.add("oculto");
    document.getElementById("sistema").classList.remove("oculto");

    const nombre = document.querySelector(".profile-name strong");
    if (nombre) nombre.textContent = usuario.empresa;

    mostrarPantalla("inicio", null);
}


async function hashPassword(texto) {
    const datos = new TextEncoder().encode(texto);
    const buffer = await crypto.subtle.digest("SHA-256", datos);
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
function cerrarSesion() {
    cerrarMenuPerfil();

    sessionStorage.removeItem("sesion");
    localStorage.removeItem("sesion");
    document.getElementById("login-password").value = "";

    document.getElementById("sistema").classList.add("oculto");
    document.getElementById("login").classList.remove("oculto");
}
