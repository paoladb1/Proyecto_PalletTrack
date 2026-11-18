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
        consultas: "Consulta de trazabilidad y stock",
    };

    document.getElementById("titulo-pagina").textContent =
        titulos[nombre] || "PalletTrack";

    const renderizadores = {
        inicio: renderizarInicio,
        productos: renderizarProductos,
        ubicaciones: renderizarUbicaciones,
        despachos: renderizarDespachos,
        consultas: filtrarStock,
        telemetria: filtrarTelemetria
    };
    if (renderizadores[nombre]) renderizadores[nombre]();

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

function alCargarDOM(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
        callback();
    }
}

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
    cargarEmpresa();
    cerrarMenuPerfil();
}

function inicializarPanel() {
    inicializarDatosPanel();
    renderizarInicio();
    renderizarProductos();
    renderizarUbicaciones();
    renderizarDespachos();
    filtrarStock();
    filtrarTelemetria();

    const sesion = sessionStorage.getItem("sesion") || localStorage.getItem("sesion");
    if (sesion) mostrarSistema(JSON.parse(sesion));
}

document.getElementById("orden-cliente").addEventListener("change", renderizarDespachos);
document.getElementById("estado-despacho").addEventListener("change", renderizarDespachos);
alCargarDOM(inicializarPanel);
