
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

function mostrarPantalla(nombre, boton) {
    document.querySelectorAll(".content-section").forEach(pantalla => {
        pantalla.classList.add("oculto");
    });

    const pantalla = document.getElementById(nombre);

    if (!pantalla) {
        console.log("No se encontró la pantalla: " + nombre);
        return;
    }

    pantalla.classList.remove("oculto");

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    if (boton) {
        boton.classList.add("active");
    }

    const titulos = {
        inicio: "Inicio del administrador",
        productos: "Catálogo de productos",
        ubicaciones: "Catálogo de ubicaciones",
        despachos: "Asignación y despacho de tarimas",
        telemetria: "Monitor de telemetría y eventos",
        empresa: "Administración",
        consulta: "Consulta de trazabilidad y stock",
    };

    document.getElementById("titulo-pagina").textContent =
        titulos[nombre] || "PalletTrack";

    cerrarMenuPerfil();
}

function togglePerfil() {
    const menu = document.getElementById("menu-perfil");

    if (menu) {
        menu.classList.toggle("oculto");
    }
}

function cerrarMenuPerfil() {
    const menu = document.getElementById("menu-perfil");

    if (menu) {
        menu.classList.add("oculto");
    }
}

function guardarEmpresa(event) {
    event.preventDefault();

    const empresa = {
        nombre: document.getElementById("empresa-nombre").value,
        rfc: document.getElementById("empresa-rfc").value,
        correo: document.getElementById("empresa-correo").value,
        telefono: document.getElementById("empresa-telefono").value,
        direccion: document.getElementById("empresa-direccion").value
    };

    localStorage.setItem("datosEmpresa", JSON.stringify(empresa));

    alert("La información de la empresa se guardó correctamente.");
}

function cargarEmpresa() {
    const datos = localStorage.getItem("datosEmpresa");
    const campoNombre = document.getElementById("empresa-nombre");

    if (!datos || !campoNombre) return;

    const empresa = JSON.parse(datos);

    document.getElementById("empresa-nombre").value = empresa.nombre || "";
    document.getElementById("empresa-rfc").value = empresa.rfc || "";
    document.getElementById("empresa-correo").value = empresa.correo || "";
    document.getElementById("empresa-telefono").value = empresa.telefono || "";
    document.getElementById("empresa-direccion").value = empresa.direccion || "";
}

function cerrarSesion() {
    cerrarMenuPerfil();

    sessionStorage.removeItem("sesion");
    localStorage.removeItem("sesion");
    document.getElementById("login-password").value = "";

    document.getElementById("sistema").classList.add("oculto");
    document.getElementById("login").classList.remove("oculto");
}

function alCargarDOM(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
        callback();
    }
}

alCargarDOM(function() {
    const sesion = sessionStorage.getItem("sesion") || localStorage.getItem("sesion");
    if (sesion) {
        const usuario = JSON.parse(sesion);
        mostrarSistema(usuario);
    }
});

document.addEventListener("click", function(event) {
    const perfil = document.querySelector(".profile-menu");

    if (perfil && !perfil.contains(event.target)) {
        cerrarMenuPerfil();
    }
});

function irInicio() {
    mostrarPantalla("inicio", null);
    cerrarMenuPerfil();
}

function irAdministracion() {
    mostrarPantalla("empresa", null);
    cerrarMenuPerfil();
}

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

// ===== CONSULTAS: datos de ejemplo =====
const movimientos = [
    { fecha: "20/02/26 08:15", tarima: "PAL-2026-001", lote: "LOT-2026-05", evento: "Recepción", ubicacion: "Almacén Norte / A-02", escaner: "SCANNER-01" },
    { fecha: "20/02/26 10:30", tarima: "PAL-2026-001", lote: "LOT-2026-05", evento: "Reubicación", ubicacion: "Almacén Norte / Rack 04", escaner: "SCANNER-01" },
    { fecha: "21/02/26 09:10", tarima: "PAL-2026-001", lote: "LOT-2026-05", evento: "Traslado", ubicacion: "Almacén Centro / B-01", escaner: "SCANNER-02" },
    { fecha: "22/02/26 10:26", tarima: "PAL-2026-003", lote: "LOT-2026-05", evento: "Recepción", ubicacion: "Almacén Sur / C-03", escaner: "SCANNER-01" },
    { fecha: "23/02/26 11:40", tarima: "PAL-2026-002", lote: "LOT-2026-06", evento: "Despacho", ubicacion: "Almacén Centro / Andén 2", escaner: "SCANNER-02" }
];

const stockAlmacenes = [
    { sku: "PRO-001", producto: "Tarima de madera", norte: 60, centro: 40, sur: 20 },
    { sku: "PRO-002", producto: "Materia prima", norte: 100, centro: 80, sur: 30 },
    { sku: "PRO-003", producto: "Empaque industrial", norte: 0, centro: 0, sur: 0 }
];

// ===== TRAZABILIDAD =====
function consultarTrazabilidad() {
    const tipo = document.getElementById("consulta-tipo").value;
    const codigo = document.getElementById("consulta-codigo").value.trim().toUpperCase();
    const tabla = document.getElementById("trazabilidad-tabla");
    const resumen = document.getElementById("trazabilidad-resumen");

    if (!codigo) {
        resumen.textContent = "Escribe un código para ver su recorrido.";
        tabla.innerHTML = '<tr><td colspan="6">Sin resultados todavía.</td></tr>';
        return;
    }

    const campo = tipo === "lote" ? "lote" : "tarima";
    const resultados = movimientos.filter(m => m[campo].toUpperCase() === codigo);

    if (resultados.length === 0) {
        resumen.textContent = "No se encontraron movimientos para " + codigo + ".";
        tabla.innerHTML = '<tr><td colspan="6">Verifica el código e intenta de nuevo.</td></tr>';
        return;
    }

    resumen.textContent = resultados.length + " movimientos encontrados para " + codigo + ".";
    tabla.innerHTML = resultados.map(m => `
        <tr>
            <td>${m.fecha}</td>
            <td>${m.tarima}</td>
            <td>${m.lote}</td>
            <td>${m.evento}</td>
            <td>${m.ubicacion}</td>
            <td>${m.escaner}</td>
        </tr>`).join("");
}

// ===== STOCK MULTIALMACÉN =====
function filtrarStock() {
    const texto = document.getElementById("stock-buscar").value.trim().toLowerCase();
    const tabla = document.getElementById("stock-tabla");

    const filas = stockAlmacenes.filter(p =>
        p.sku.toLowerCase().includes(texto) || p.producto.toLowerCase().includes(texto)
    );

    tabla.innerHTML = filas.length === 0
        ? '<tr><td colspan="7">No hay productos que coincidan.</td></tr>'
        : filas.map(p => {
            const total = p.norte + p.centro + p.sur;
            const estado = total === 0
                ? '<span class="badge agotado">Agotado</span>'
                : '<span class="badge disponible">Disponible</span>';
            return `
                <tr>
                    <td>${p.sku}</td>
                    <td>${p.producto}</td>
                    <td>${p.norte}</td>
                    <td>${p.centro}</td>
                    <td>${p.sur}</td>
                    <td><strong>${total}</strong></td>
                    <td>${estado}</td>
                </tr>`;
        }).join("");

    document.getElementById("stock-pie").textContent =
        "Mostrando " + filas.length + " de " + stockAlmacenes.length + " productos";
}

alCargarDOM(filtrarStock);