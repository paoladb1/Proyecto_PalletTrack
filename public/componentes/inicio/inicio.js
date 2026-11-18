function renderizarInicio() {
    const total = document.getElementById("inicio-productos");
    if (!total) return;
    total.textContent = productos.filter(producto => producto.activo !== false).length;
    document.getElementById("inicio-ubicaciones").textContent = ubicaciones.length;
    document.getElementById("inicio-despachos").textContent =
        despachos.filter(despacho => despacho.estado === "Pendiente").length;
}
