
function entrar() {
    document.getElementById("login").classList.add("oculto");
    document.getElementById("sistema").classList.remove("oculto");

    mostrarPantalla("inicio", null);
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
        empresa: "Administración"
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

    if (!datos) return;

    const empresa = JSON.parse(datos);

    document.getElementById("empresa-nombre").value = empresa.nombre || "";
    document.getElementById("empresa-rfc").value = empresa.rfc || "";
    document.getElementById("empresa-correo").value = empresa.correo || "";
    document.getElementById("empresa-telefono").value = empresa.telefono || "";
    document.getElementById("empresa-direccion").value = empresa.direccion || "";
}

function cerrarSesion() {
    cerrarMenuPerfil();

    document.getElementById("sistema").classList.add("oculto");
    document.getElementById("login").classList.remove("oculto");
}

document.addEventListener("DOMContentLoaded", cargarEmpresa);

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

