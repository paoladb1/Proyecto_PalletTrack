
function entrar() {
    document.getElementById("login").classList.add("oculto");
    document.getElementById("sistema").classList.remove("oculto");

    mostrarPantalla("productos", document.querySelector(".menu-item"));
}

function mostrarPantalla(nombre, boton) {
    // Ocultar todas las pantallas
    document.querySelectorAll(".content-section").forEach(pantalla => {
        pantalla.classList.add("oculto");
    });

    // Mostrar la pantalla seleccionada
    const pantalla = document.getElementById(nombre);
    if (!pantalla) return;

    pantalla.classList.remove("oculto");

    // Actualizar el menú activo
    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    if (boton) {
        boton.classList.add("active");
    }

    // Cambiar el título superior
    const titulos = {
        productos: "Catálogo de productos",
        ubicaciones: "Catálogo de ubicaciones",
        despachos: "Asignación y despacho de tarimas",
        telemetria: "Monitor de telemetría y eventos"
    };

    document.getElementById("titulo-pagina").textContent =
        titulos[nombre] || "PalletTrack";
}

function cerrarSesion() {
    document.getElementById("sistema").classList.add("oculto");
    document.getElementById("login").classList.remove("oculto");
}
