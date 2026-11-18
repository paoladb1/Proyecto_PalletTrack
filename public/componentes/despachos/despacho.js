function renderizarDespachos() {
    const orden = document.getElementById("orden-cliente").value;
    const estado = document.getElementById("estado-despacho").value;
    const deOrden = despachos.filter(despacho => despacho.orden === orden);
    const filtrados = deOrden.filter(despacho => estado === "todos" || despacho.estado === estado);
    const cuerpo = document.getElementById("despachos-tabla");

    document.getElementById("despacho-asignadas").textContent = deOrden.length;
    document.getElementById("despacho-pendientes").textContent =
        deOrden.filter(despacho => despacho.estado === "Pendiente").length;
    cuerpo.innerHTML = filtrados.length
        ? filtrados.map(despacho => `<tr>
            <td>${escaparHTML(despacho.codigo)}</td>
            <td>${escaparHTML(despacho.lote)}</td>
            <td>${escaparHTML(despacho.ubicacion)}</td>
            <td><span class="badge ${despacho.estado === "Pendiente" ? "disponible" : "ocupado"}">${escaparHTML(despacho.estado)}</span></td>
            <td><button class="btn-small" type="button" data-tarima="${escaparHTML(despacho.codigo)}" onclick="seleccionarTarima(this.dataset.tarima)">Validar</button></td>
        </tr>`).join("")
        : '<tr><td colspan="5">No hay tarimas para estos filtros.</td></tr>';
}

function seleccionarTarima(codigo) {
    document.getElementById("codigo-tarima").value = codigo;
    validarTarima();
}

function validarTarima() {
    const codigo = document.getElementById("codigo-tarima").value.trim().toUpperCase();
    const orden = document.getElementById("orden-cliente").value;
    const encontrada = despachos.find(despacho => despacho.codigo.toUpperCase() === codigo);
    const mensaje = document.getElementById("despacho-mensaje");
    const boton = document.getElementById("confirmar-despacho");

    tarimaValidada = null;
    boton.disabled = true;
    if (!codigo) {
        mensaje.textContent = "Escribe o selecciona un código QR.";
        mostrarEstadoValidacion(false, "Código requerido", "Ingresa un código de tarima válido.");
        return;
    }
    if (!encontrada) {
        mensaje.textContent = "No se encontró la tarima " + codigo + ".";
        mostrarEstadoValidacion(false, "Tarima no encontrada", "Verifica el código e inténtalo de nuevo.");
        return;
    }
    if (encontrada.orden !== orden) {
        mensaje.textContent = "La tarima pertenece a otra orden.";
        mostrarEstadoValidacion(false, "Orden incorrecta", "Selecciona la orden " + encontrada.orden + ".");
        return;
    }
    if (encontrada.estado !== "Pendiente") {
        mensaje.textContent = "La tarima ya fue despachada.";
        mostrarEstadoValidacion(false, "Tarima ya despachada", "No se puede confirmar dos veces el mismo embarque.");
        return;
    }
    if (encontrada.sku && encontrada.almacen) {
        const producto = productos.find(item => item.sku === encontrada.sku);
        if (!producto || producto.activo === false || Number(producto[encontrada.almacen] || 0) < 1) {
            mensaje.textContent = "No hay existencias disponibles para esta tarima.";
            mostrarEstadoValidacion(false, "Existencia insuficiente", "Revisa el producto y el almacén antes de confirmar.");
            return;
        }
    }

    tarimaValidada = encontrada;
    mensaje.textContent = "Tarima validada correctamente.";
    boton.disabled = false;
    mostrarEstadoValidacion(true, "Tarima disponible", "El código coincide con la orden seleccionada.");
    document.getElementById("pallet-info").innerHTML = `<div class="section-title">
        <h3>${escaparHTML(encontrada.codigo)}</h3><span class="badge disponible">Pendiente</span>
    </div>
    <p><strong>Lote:</strong> ${escaparHTML(encontrada.lote)}</p>
    <p><strong>Producto:</strong> ${escaparHTML(encontrada.producto)}</p>
    <p><strong>Ubicación:</strong> ${escaparHTML(encontrada.ubicacion)}</p>`;
}

function mostrarEstadoValidacion(valido, titulo, mensaje) {
    const icono = document.getElementById("despacho-icon");
    icono.textContent = valido ? "✓" : "!";
    icono.classList.toggle("validation-error", !valido);
    document.getElementById("despacho-control-titulo").textContent = titulo;
    document.getElementById("despacho-control-mensaje").textContent = mensaje;
}

function confirmarDespacho() {
    if (!tarimaValidada || tarimaValidada.estado !== "Pendiente") {
        alert("Valida una tarima pendiente antes de confirmar el embarque.");
        return;
    }

    const tarima = tarimaValidada;
    tarima.estado = "Despachada";
    if (tarima.sku && tarima.almacen) {
        const producto = productos.find(item => item.sku === tarima.sku);
        producto[tarima.almacen] = Number(producto[tarima.almacen] || 0) - 1;
        guardarDatosProductos();
    }
    const fecha = new Date().toISOString();
    movimientos.push({
        fecha: fecha,
        tarima: tarima.codigo,
        lote: tarima.lote,
        evento: "Despacho",
        ubicacion: tarima.ubicacion,
        escaner: "SCANNER-01"
    });
    eventosTelemetria.unshift({
        escaner: "SCANNER-01",
        tarima: tarima.codigo,
        bateria: 90,
        evento: "DESPACHO_CONFIRMADO",
        descripcion: "Despacho confirmado para la orden " + tarima.orden + ".",
        fecha: fecha
    });
    guardarDatosDespachos();
    guardarLista(clavesPanel.movimientos, movimientos);
    guardarLista(clavesPanel.telemetria, eventosTelemetria);
    tarimaValidada = null;
    document.getElementById("codigo-tarima").value = "";
    document.getElementById("despacho-mensaje").textContent = "Embarque confirmado correctamente.";
    document.getElementById("pallet-info").innerHTML = "<p>Escanea otra tarima para continuar.</p>";
    document.getElementById("confirmar-despacho").disabled = true;
    mostrarEstadoValidacion(true, "Embarque confirmado", "La tarima quedó registrada como despachada.");
    renderizarDespachos();
    renderizarInicio();
}
