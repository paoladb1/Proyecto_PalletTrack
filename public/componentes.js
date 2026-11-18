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

async function iniciarAplicacion() {
    const raiz = document.getElementById("app");

    try {
        await cargarComponentes(raiz);

        await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "app.js";
            script.onload = resolve;
            script.onerror = () => reject(new Error("No se pudo cargar app.js."));
            document.body.appendChild(script);
        });
    } catch (error) {
        console.error("Error al iniciar PalletTrack:", error);
        raiz.textContent = "No se pudo cargar la aplicación. Recarga la página e inténtalo de nuevo.";
    }
}

iniciarAplicacion();
