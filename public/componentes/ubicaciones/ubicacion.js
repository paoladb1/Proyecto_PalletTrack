function renderizarUbicaciones() {
    const cuerpo = document.getElementById("ubicaciones-tabla");
    if (!cuerpo) return;

    const texto = document.getElementById("ubicacion-buscar").value.trim().toLowerCase();
    const filtradas = ubicaciones
        .map((ubicacion, indice) => ({ ubicacion: ubicacion, indice: indice }))
        .filter(({ ubicacion }) =>
            [ubicacion.codigo, ubicacion.zona, ubicacion.rack, ubicacion.nivel]
                .some(valor => valor.toLowerCase().includes(texto))
        );

    cuerpo.innerHTML = filtradas.length
        ? filtradas.map(({ ubicacion, indice }) => `<tr>
            <td>${escaparHTML(ubicacion.codigo)}</td>
            <td>${escaparHTML(ubicacion.zona)}</td>
            <td>${escaparHTML(ubicacion.rack)}</td>
            <td>${escaparHTML(ubicacion.nivel)}</td>
            <td><span class="badge ${ubicacion.estado === "Ocupado" ? "ocupado" : "disponible"}">${escaparHTML(ubicacion.estado)}</span></td>
            <td class="catalog-actions">
                <button class="btn-small" type="button" onclick="editarUbicacion(${indice})">Editar</button>
                <button class="btn-small" type="button" onclick="eliminarUbicacion(${indice})">Eliminar</button>
            </td>
        </tr>`).join("")
        : '<tr><td colspan="6">No hay ubicaciones que coincidan.</td></tr>';

    document.getElementById("ubicaciones-total").textContent = ubicaciones.length;
    document.getElementById("ubicaciones-zonas").textContent =
        new Set(ubicaciones.map(ubicacion => ubicacion.zona)).size;
    document.getElementById("ubicaciones-racks").textContent =
        new Set(ubicaciones.map(ubicacion => ubicacion.rack)).size;
    document.getElementById("ubicaciones-pie").textContent =
        "Mostrando " + filtradas.length + " de " + ubicaciones.length + " ubicaciones";
}

function filtrarUbicaciones() {
    renderizarUbicaciones();
}

function mostrarFormularioUbicacion() {
    const formulario = document.getElementById("form-ubicacion");
    formulario.reset();
    delete formulario.dataset.codigoOriginal;
    document.getElementById("ubicacion-codigo").disabled = false;
    document.getElementById("ubicacion-form-titulo").textContent = "Agregar ubicación";
    formulario.classList.remove("oculto");
    document.getElementById("ubicacion-codigo").focus();
}

function editarUbicacion(indice) {
    const ubicacion = ubicaciones[indice];
    if (!ubicacion) return;
    const formulario = document.getElementById("form-ubicacion");
    formulario.dataset.codigoOriginal = ubicacion.codigo;
    document.getElementById("ubicacion-codigo").value = ubicacion.codigo;
    document.getElementById("ubicacion-codigo").disabled = true;
    document.getElementById("ubicacion-zona").value = ubicacion.zona;
    document.getElementById("ubicacion-rack").value = ubicacion.rack;
    document.getElementById("ubicacion-nivel").value = ubicacion.nivel;
    document.getElementById("ubicacion-estado").value = ubicacion.estado;
    document.getElementById("ubicacion-form-titulo").textContent = "Editar ubicación";
    formulario.classList.remove("oculto");
    document.getElementById("ubicacion-zona").focus();
}

function guardarUbicacion(event) {
    event.preventDefault();
    const formulario = event.currentTarget;
    const codigo = document.getElementById("ubicacion-codigo").value.trim().toUpperCase();
    const codigoOriginal = formulario.dataset.codigoOriginal;
    if (!codigoOriginal && ubicaciones.some(ubicacion => ubicacion.codigo.toUpperCase() === codigo)) {
        alert("Ya existe una ubicación con ese código.");
        return;
    }

    const existente = codigoOriginal
        ? ubicaciones.find(ubicacion => ubicacion.codigo === codigoOriginal)
        : null;
    const ubicacion = {
        codigo: codigo,
        zona: document.getElementById("ubicacion-zona").value.trim(),
        rack: document.getElementById("ubicacion-rack").value.trim(),
        nivel: document.getElementById("ubicacion-nivel").value.trim(),
        estado: document.getElementById("ubicacion-estado").value
    };

    if (existente) {
        Object.assign(existente, ubicacion);
    } else {
        ubicaciones.push(ubicacion);
    }

    guardarDatosUbicaciones();
    cancelarUbicacion();
    renderizarUbicaciones();
    renderizarInicio();
}

function cancelarUbicacion() {
    const formulario = document.getElementById("form-ubicacion");
    formulario.reset();
    formulario.classList.add("oculto");
    delete formulario.dataset.codigoOriginal;
    document.getElementById("ubicacion-codigo").disabled = false;
}

function eliminarUbicacion(indice) {
    const ubicacion = ubicaciones[indice];
    if (!ubicacion) return;
    if (ubicacion.estado === "Ocupado") {
        alert("No se puede eliminar una ubicación ocupada. Cámbiala a disponible primero.");
        return;
    }
    if (!confirm("¿Quieres eliminar la ubicación " + ubicacion.codigo + "?")) return;
    ubicaciones.splice(indice, 1);
    guardarDatosUbicaciones();
    renderizarUbicaciones();
    renderizarInicio();
}
