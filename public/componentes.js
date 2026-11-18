async function cargarComponentes(contenedor) {
    let componente = contenedor.querySelector("[data-componente]");

    while (componente) {
        const nombre = componente.dataset.componente;
        const respuesta = await fetch(`componentes/${nombre}.html`);

        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar componentes/${nombre}.html (${respuesta.status}).`);
        }

        componente.outerHTML = await respuesta.text();
        componente = contenedor.querySelector("[data-componente]");
    }
}

async function cargarScript(ruta) {
    await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = ruta;
        script.onload = resolve;
        script.onerror = () => reject(new Error("No se pudo cargar " + ruta + "."));
        document.body.appendChild(script);
    });
}

async function iniciarAplicacion() {
    const raiz = document.getElementById("app");

    try {
        await cargarComponentes(raiz);

        const scripts = [
            "componentes/datos/datos.js",
            "componentes/inicio/inicio.js",
            "componentes/productos/producto.js",
            "componentes/ubicaciones/ubicacion.js",
            "componentes/despachos/despacho.js",
            "componentes/consultas/consulta.js",
            "componentes/telemetria/telemetria.js",
            "componentes/administrador/administrador.js",
            "componentes/registro/registro.js",
            "componentes/login/login.js",
            "app.js"
        ];

        for (const ruta of scripts) {
            await cargarScript(ruta);
        }
    } catch (error) {
        console.error("Error al iniciar PalletTrack:", error);
        raiz.textContent = "No se pudo cargar la aplicación. Recarga la página e inténtalo de nuevo.";
    }
}

iniciarAplicacion();
