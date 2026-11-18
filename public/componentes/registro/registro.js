function irRegistro() {
    document.getElementById("login").classList.add("oculto");
    document.getElementById("registro").classList.remove("oculto");
}

const campos = {
    empresa: document.getElementById("reg-empresa"),
    nombre: document.getElementById("reg-nombre"),
    correo: document.getElementById("reg-correo"),
    password: document.getElementById("reg-password"),
    confirmar: document.getElementById("reg-confirmar"),
    terminos: document.getElementById("reg-terminos")
};

function mostrarError(campo, mensaje) {
    const error = document.getElementById("error-" + campo);
    error.textContent = mensaje;

    if (campos[campo].type !== "checkbox") {
        campos[campo].classList.toggle("invalido", Boolean(mensaje));
    }
}

function validarRegistro() {
    let valido = true;

    const empresa = campos.empresa.value.trim();
    const nombre = campos.nombre.value.trim();
    const correo = campos.correo.value.trim();
    const password = campos.password.value;
    const confirmar = campos.confirmar.value;

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    const reglas = [
        ["empresa", empresa === "", "Escribe el nombre de la empresa."],
        ["nombre", nombre === "", "Escribe tu nombre completo."],
        ["correo", !correoValido, "Escribe un correo válido, por ejemplo usuario@empresa.com."],
        ["password", password.length < 8, "La contraseña debe tener al menos 8 caracteres."],
        ["confirmar", confirmar !== password || confirmar === "", "Las contraseñas no coinciden."],
        ["terminos", !campos.terminos.checked, "Debes aceptar los términos para continuar."]
    ];

    reglas.forEach(([campo, hayError, mensaje]) => {
        mostrarError(campo, hayError ? mensaje : "");
        if (hayError) valido = false;
    });

    return valido;
}

async function registrarUsuario(event) {
    event.preventDefault();

    if (!validarRegistro()) return;

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const correo = campos.correo.value.trim().toLowerCase();

    if (usuarios.some(u => u.correo === correo)) {
        mostrarError("correo", "Este correo ya está registrado.");
        return;
    }

    // Nota: la contraseña NO se guarda en el navegador.
    // Cuando exista un backend, ahí se debe guardar (cifrada).
    usuarios.push({
        empresa: campos.empresa.value.trim(),
        nombre: campos.nombre.value.trim(),
        correo: correo,
        password: await hashPassword(campos.password.value)
    });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Precarga los datos en la pantalla de Administración
    localStorage.setItem("datosEmpresa", JSON.stringify({
        nombre: campos.empresa.value.trim(),
        rfc: "",
        correo: correo,
        telefono: "",
        direccion: ""
    }));

    const mensaje = document.getElementById("reg-mensaje");
    mensaje.textContent = "Cuenta creada. Redirigiendo al inicio de sesión...";
    mensaje.classList.remove("oculto");

    setTimeout(volverLogin, 1500);
}

function volverLogin() {
    document.getElementById("registro").classList.add("oculto");
    document.getElementById("login").classList.remove("oculto");

    document.getElementById("form-registro").reset();
    document.getElementById("reg-mensaje").classList.add("oculto");
}
