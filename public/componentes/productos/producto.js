function renderizarProductos() {
    const cuerpo = document.getElementById("productos-tabla");
    if (!cuerpo) return;

    const texto = document.getElementById("producto-buscar").value.trim().toLowerCase();
    const filtrados = productos
        .map((producto, indice) => ({ producto: producto, indice: indice }))
        .filter(({ producto }) =>
            producto.sku.toLowerCase().includes(texto) ||
            producto.producto.toLowerCase().includes(texto)
        );

    cuerpo.innerHTML = filtrados.length
        ? filtrados.map(({ producto, indice }) => {
            const total = totalProducto(producto);
            const estado = producto.activo === false
                ? '<span class="badge agotado">Inactivo</span>'
                : total === 0
                    ? '<span class="badge agotado">Agotado</span>'
                    : '<span class="badge disponible">Disponible</span>';
            return `<tr>
                <td>${escaparHTML(producto.sku)}</td>
                <td>${escaparHTML(producto.producto)}</td>
                <td>${escaparHTML(producto.unidad)}</td>
                <td>${total}</td>
                <td>${estado}</td>
                <td class="catalog-actions">
                    <button class="btn-small" type="button" onclick="editarProducto(${indice})">Editar</button>
                    <button class="btn-small" type="button" onclick="cambiarEstadoProducto(${indice})">${producto.activo === false ? "Activar" : "Dar de baja"}</button>
                </td>
            </tr>`;
        }).join("")
        : '<tr><td colspan="6">No hay productos que coincidan.</td></tr>';

    const activos = productos.filter(producto => producto.activo !== false);
    document.getElementById("productos-total").textContent = productos.length;
    document.getElementById("productos-disponibles").textContent =
        activos.filter(producto => totalProducto(producto) > 0).length;
    document.getElementById("productos-unidades").textContent =
        activos.reduce((suma, producto) => suma + totalProducto(producto), 0);
    document.getElementById("productos-pie").textContent =
        "Mostrando " + filtrados.length + " de " + productos.length + " productos";
}

function filtrarProductos() {
    renderizarProductos();
}

function mostrarFormularioProducto() {
    const formulario = document.getElementById("form-producto");
    formulario.reset();
    delete formulario.dataset.skuOriginal;
    document.getElementById("producto-sku").disabled = false;
    document.getElementById("producto-form-titulo").textContent = "Agregar producto";
    formulario.classList.remove("oculto");
    document.getElementById("producto-sku").focus();
}

function editarProducto(indice) {
    const producto = productos[indice];
    if (!producto) return;

    const formulario = document.getElementById("form-producto");
    formulario.dataset.skuOriginal = producto.sku;
    document.getElementById("producto-sku").value = producto.sku;
    document.getElementById("producto-sku").disabled = true;
    document.getElementById("producto-nombre").value = producto.producto;
    document.getElementById("producto-unidad").value = producto.unidad;
    document.getElementById("producto-norte").value = producto.norte;
    document.getElementById("producto-centro").value = producto.centro;
    document.getElementById("producto-sur").value = producto.sur;
    document.getElementById("producto-form-titulo").textContent = "Editar producto";
    formulario.classList.remove("oculto");
    document.getElementById("producto-nombre").focus();
}

function guardarProducto(event) {
    event.preventDefault();
    const formulario = event.currentTarget;
    const sku = document.getElementById("producto-sku").value.trim().toUpperCase();
    const skuOriginal = formulario.dataset.skuOriginal;
    if (!skuOriginal && productos.some(producto => producto.sku.toUpperCase() === sku)) {
        alert("Ya existe un producto con ese SKU.");
        return;
    }

    const existente = skuOriginal ? productos.find(producto => producto.sku === skuOriginal) : null;
    const producto = {
        sku: sku,
        producto: document.getElementById("producto-nombre").value.trim(),
        unidad: document.getElementById("producto-unidad").value.trim(),
        norte: Number(document.getElementById("producto-norte").value),
        centro: Number(document.getElementById("producto-centro").value),
        sur: Number(document.getElementById("producto-sur").value),
        activo: existente ? existente.activo !== false : true
    };

    if (existente) {
        Object.assign(existente, producto);
    } else {
        productos.push(producto);
    }

    guardarDatosProductos();
    formulario.classList.add("oculto");
    delete formulario.dataset.skuOriginal;
    document.getElementById("producto-sku").disabled = false;
    renderizarProductos();
    renderizarInicio();
}

function cancelarProducto() {
    const formulario = document.getElementById("form-producto");
    formulario.reset();
    formulario.classList.add("oculto");
    delete formulario.dataset.skuOriginal;
    document.getElementById("producto-sku").disabled = false;
}

function cambiarEstadoProducto(indice) {
    const producto = productos[indice];
    if (!producto) return;
    const accion = producto.activo === false ? "activar" : "dar de baja";
    if (!confirm("¿Quieres " + accion + " el producto " + producto.sku + "?")) return;
    producto.activo = producto.activo === false;
    guardarDatosProductos();
    renderizarProductos();
    renderizarInicio();
}
