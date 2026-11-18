const clavesPanel = {
    productos: "pallettrack.productos.v1",
    ubicaciones: "pallettrack.ubicaciones.v1",
    despachos: "pallettrack.despachos.v1",
    movimientos: "pallettrack.movimientos.v1",
    telemetria: "pallettrack.telemetria.v1"
};

const datosInicialesPanel = {
    productos: [
        { sku: "PRO-001", producto: "Tarima de madera", unidad: "Pieza", norte: 60, centro: 40, sur: 20, activo: true },
        { sku: "PRO-002", producto: "Materia prima", unidad: "Kilogramo", norte: 100, centro: 80, sur: 30, activo: true },
        { sku: "PRO-003", producto: "Empaque industrial", unidad: "Paquete", norte: 0, centro: 0, sur: 0, activo: true }
    ],
    ubicaciones: [
        { codigo: "UBI-001", zona: "Zona A", rack: "Rack 01", nivel: "Nivel 01", estado: "Disponible" },
        { codigo: "UBI-002", zona: "Zona B", rack: "Rack 03", nivel: "Nivel 02", estado: "Disponible" },
        { codigo: "UBI-003", zona: "Zona C", rack: "Rack 04", nivel: "Nivel 01", estado: "Ocupado" }
    ],
    despachos: [
        { codigo: "PAL-2026-001", orden: "PED-2026-018", lote: "LOT-2026-05", sku: "PRO-001", almacen: "norte", producto: "Tarima de madera", ubicacion: "Almacén Norte / A-02", estado: "Pendiente" },
        { codigo: "PAL-2026-002", orden: "PED-2026-018", lote: "LOT-2026-06", sku: "PRO-002", almacen: "centro", producto: "Materia prima", ubicacion: "Almacén Centro / B-01", estado: "Pendiente" },
        { codigo: "PAL-2026-003", orden: "PED-2026-019", lote: "LOT-2026-05", sku: "PRO-003", almacen: "sur", producto: "Empaque industrial", ubicacion: "Almacén Sur / C-03", estado: "Despachada" }
    ],
    movimientos: [
        { fecha: "2026-02-20T08:15:00", tarima: "PAL-2026-001", lote: "LOT-2026-05", evento: "Recepción", ubicacion: "Almacén Norte / A-02", escaner: "SCANNER-01" },
        { fecha: "2026-02-20T10:30:00", tarima: "PAL-2026-001", lote: "LOT-2026-05", evento: "Reubicación", ubicacion: "Almacén Norte / Rack 04", escaner: "SCANNER-01" },
        { fecha: "2026-02-21T09:10:00", tarima: "PAL-2026-001", lote: "LOT-2026-05", evento: "Traslado", ubicacion: "Almacén Centro / B-01", escaner: "SCANNER-02" },
        { fecha: "2026-02-22T10:26:00", tarima: "PAL-2026-003", lote: "LOT-2026-05", evento: "Recepción", ubicacion: "Almacén Sur / C-03", escaner: "SCANNER-01" },
        { fecha: "2026-02-23T11:40:00", tarima: "PAL-2026-002", lote: "LOT-2026-06", evento: "Despacho", ubicacion: "Almacén Centro / Andén 2", escaner: "SCANNER-02" }
    ],
    telemetria: crearTelemetriaInicial()
};

let productos = [];
let ubicaciones = [];
let despachos = [];
let movimientos = [];
let eventosTelemetria = [];
let tarimaValidada = null;

function crearTelemetriaInicial() {
    const ahora = Date.now();
    return [
        { escaner: "SCANNER-01", tarima: "PAL-2026-001", bateria: 90, evento: "ESCANEO_REGISTRADO", descripcion: "Recepción registrada correctamente.", fecha: new Date(ahora - 10 * 60000).toISOString() },
        { escaner: "SCANNER-02", tarima: "PAL-2026-002", bateria: 76, evento: "BATERIA_BAJA", descripcion: "El escáner requiere carga próximamente.", fecha: new Date(ahora - 45 * 60000).toISOString() },
        { escaner: "SCANNER-01", tarima: "PAL-2026-003", bateria: 88, evento: "TARIMA_DANADA", descripcion: "Empaque reportado como dañado.", fecha: new Date(ahora - 2 * 3600000).toISOString() }
    ];
}

function leerListaGuardada(clave, datosIniciales) {
    const guardado = localStorage.getItem(clave);
    if (guardado === null) {
        const copia = JSON.parse(JSON.stringify(datosIniciales));
        localStorage.setItem(clave, JSON.stringify(copia));
        return copia;
    }

    const datos = JSON.parse(guardado);
    if (!Array.isArray(datos)) {
        throw new Error("Los datos guardados en " + clave + " no tienen el formato esperado.");
    }
    return datos;
}

function guardarLista(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function inicializarDatosPanel() {
    productos = leerListaGuardada(clavesPanel.productos, datosInicialesPanel.productos);
    ubicaciones = leerListaGuardada(clavesPanel.ubicaciones, datosInicialesPanel.ubicaciones);
    despachos = leerListaGuardada(clavesPanel.despachos, datosInicialesPanel.despachos);
    movimientos = leerListaGuardada(clavesPanel.movimientos, datosInicialesPanel.movimientos);
    eventosTelemetria = leerListaGuardada(clavesPanel.telemetria, datosInicialesPanel.telemetria);
}

function guardarDatosProductos() {
    guardarLista(clavesPanel.productos, productos);
}

function guardarDatosUbicaciones() {
    guardarLista(clavesPanel.ubicaciones, ubicaciones);
}

function guardarDatosDespachos() {
    guardarLista(clavesPanel.despachos, despachos);
}

function escaparHTML(valor) {
    return String(valor === null || valor === undefined ? "" : valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatearFecha(fecha) {
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(new Date(fecha));
}

function totalProducto(producto) {
    return Number(producto.norte || 0) + Number(producto.centro || 0) + Number(producto.sur || 0);
}
