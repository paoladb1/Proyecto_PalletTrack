function renderizarStock() {
    const texto = document.getElementById("stock-buscar").value.trim().toLowerCase();
    const cuerpo = document.getElementById("stock-tabla");
    const productosActivos = productos.filter(producto => producto.activo !== false);
    const filtrados = productosActivos.filter(producto =>
        producto.sku.toLowerCase().includes(texto) ||
        producto.producto.toLowerCase().includes(texto)
    );

    cuerpo.innerHTML = filtrados.length
        ? filtrados.map(producto => {
            const total = totalProducto(producto);
            const estado = total === 0
                ? '<span class="badge agotado">Agotado</span>'
                : '<span class="badge disponible">Disponible</span>';
            return `<tr>
                <td>${escaparHTML(producto.sku)}</td>
                <td>${escaparHTML(producto.producto)}</td>
                <td>${Number(producto.norte || 0)}</td>
                <td>${Number(producto.centro || 0)}</td>
                <td>${Number(producto.sur || 0)}</td>
                <td><strong>${total}</strong></td>
                <td>${estado}</td>
            </tr>`;
        }).join("")
        : '<tr><td colspan="7">No hay productos que coincidan.</td></tr>';

    document.getElementById("stock-pie").textContent =
        "Mostrando " + filtrados.length + " de " + productosActivos.length + " productos activos";
}

function filtrarStock() {
    renderizarStock();
}

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
    const resultados = movimientos.filter(movimiento => movimiento[campo].toUpperCase() === codigo);
    if (resultados.length === 0) {
        resumen.textContent = "No se encontraron movimientos para " + codigo + ".";
        tabla.innerHTML = '<tr><td colspan="6">Verifica el código e intenta de nuevo.</td></tr>';
        return;
    }

    resumen.textContent = resultados.length + " movimientos encontrados para " + codigo + ".";
    tabla.innerHTML = resultados.map(movimiento => `<tr>
        <td>${escaparHTML(formatearFecha(movimiento.fecha))}</td>
        <td>${escaparHTML(movimiento.tarima)}</td>
        <td>${escaparHTML(movimiento.lote)}</td>
        <td>${escaparHTML(movimiento.evento)}</td>
        <td>${escaparHTML(movimiento.ubicacion)}</td>
        <td>${escaparHTML(movimiento.escaner)}</td>
    </tr>`).join("");
}
