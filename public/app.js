
async function entrar() {
    const correo = document.getElementById("login-correo").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const error = document.getElementById("login-error");

    if (!correo || !password) {
        error.textContent = "Por favor, completa todos los campos.";
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const usuario = usuarios.find(u => u.correo === correo);
    const hash = await hashPassword(password);

    // mismo mensaje para ambos casos, para no revelar qué correos existen
    if (!usuario || usuario.password !== hash) {
        error.textContent = "Correo o contraseña incorrectos.";
        return;
    }

    const sesion = JSON.stringify({
        correo: usuario.correo,
        nombre: usuario.nombre,
        empresa: usuario.empresa
    });

    // "Recordarme": persiste entre cierres del navegador; si no, solo esta pestaña
    const recordar = document.getElementById("login-recordar").checked;
    (recordar ? localStorage : sessionStorage).setItem("sesion", sesion);

    mostrarSistema(usuario);
}

function mostrarSistema(usuario) {
    document.getElementById("login").classList.add("oculto");
    document.getElementById("registro").classList.add("oculto");
    document.getElementById("sistema").classList.remove("oculto");

    const nombre = document.querySelector(".profile-name strong");
    if (nombre) nombre.textContent = usuario.empresa;

    mostrarPantalla("inicio", null);
}


async function hashPassword(texto) {
    const datos = new TextEncoder().encode(texto);
    const buffer = await crypto.subtle.digest("SHA-256", datos);
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
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
        empresa: "Administración",
        consultas: "Consulta de trazabilidad y stock",
    };

    document.getElementById("titulo-pagina").textContent =
        titulos[nombre] || "PalletTrack";

    const renderizadores = {
        inicio: renderizarInicio,
        productos: renderizarProductos,
        ubicaciones: renderizarUbicaciones,
        despachos: renderizarDespachos,
        consultas: filtrarStock,
        telemetria: filtrarTelemetria
    };
    if (renderizadores[nombre]) renderizadores[nombre]();

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
    actualizarPerfilEmpresa(empresa.nombre);

    alert("La información de la empresa se guardó correctamente.");
}

function cargarEmpresa() {
    const datos = localStorage.getItem("datosEmpresa");
    const campoNombre = document.getElementById("empresa-nombre");

    if (!datos || !campoNombre) return;

    const empresa = JSON.parse(datos);

    document.getElementById("empresa-nombre").value = empresa.nombre || "";
    document.getElementById("empresa-rfc").value = empresa.rfc || "";
    document.getElementById("empresa-correo").value = empresa.correo || "";
    document.getElementById("empresa-telefono").value = empresa.telefono || "";
    document.getElementById("empresa-direccion").value = empresa.direccion || "";
}

function cerrarSesion() {
    cerrarMenuPerfil();

    sessionStorage.removeItem("sesion");
    localStorage.removeItem("sesion");
    document.getElementById("login-password").value = "";

    document.getElementById("sistema").classList.add("oculto");
    document.getElementById("login").classList.remove("oculto");
}

function alCargarDOM(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
        callback();
    }
}

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
    cargarEmpresa();
    cerrarMenuPerfil();
}

function irRegistro() {
    document.getElementById("login").classList.add("oculto");
    document.getElementById("registro").classList.remove("oculto");
}

const campos = {
    empresa: document.getElementById("reg-empresa"),
    nombre: document.getElementById("reg-nombre"),
    correo: document.getElementById("reg-correo"),
    password: document.getElementById("reg-password"),
    confirmar: document.getElementById("reg-confirmar"),
    terminos: document.getElementById("reg-terminos")
};

function mostrarError(campo, mensaje) {
    const error = document.getElementById("error-" + campo);
    error.textContent = mensaje;

    if (campos[campo].type !== "checkbox") {
        campos[campo].classList.toggle("invalido", Boolean(mensaje));
    }
}

function validarRegistro() {
    let valido = true;

    const empresa = campos.empresa.value.trim();
    const nombre = campos.nombre.value.trim();
    const correo = campos.correo.value.trim();
    const password = campos.password.value;
    const confirmar = campos.confirmar.value;

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    const reglas = [
        ["empresa", empresa === "", "Escribe el nombre de la empresa."],
        ["nombre", nombre === "", "Escribe tu nombre completo."],
        ["correo", !correoValido, "Escribe un correo válido, por ejemplo usuario@empresa.com."],
        ["password", password.length < 8, "La contraseña debe tener al menos 8 caracteres."],
        ["confirmar", confirmar !== password || confirmar === "", "Las contraseñas no coinciden."],
        ["terminos", !campos.terminos.checked, "Debes aceptar los términos para continuar."]
    ];

    reglas.forEach(([campo, hayError, mensaje]) => {
        mostrarError(campo, hayError ? mensaje : "");
        if (hayError) valido = false;
    });

    return valido;
}

async function registrarUsuario(event) {
    event.preventDefault();

    if (!validarRegistro()) return;

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const correo = campos.correo.value.trim().toLowerCase();

    if (usuarios.some(u => u.correo === correo)) {
        mostrarError("correo", "Este correo ya está registrado.");
        return;
    }

    // Nota: la contraseña NO se guarda en el navegador.
    // Cuando exista un backend, ahí se debe guardar (cifrada).
    usuarios.push({
        empresa: campos.empresa.value.trim(),
        nombre: campos.nombre.value.trim(),
        correo: correo,
        password: await hashPassword(campos.password.value)
    });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Precarga los datos en la pantalla de Administración
    localStorage.setItem("datosEmpresa", JSON.stringify({
        nombre: campos.empresa.value.trim(),
        rfc: "",
        correo: correo,
        telefono: "",
        direccion: ""
    }));

    const mensaje = document.getElementById("reg-mensaje");
    mensaje.textContent = "Cuenta creada. Redirigiendo al inicio de sesión...";
    mensaje.classList.remove("oculto");

    setTimeout(volverLogin, 1500);
}

function volverLogin() {
    document.getElementById("registro").classList.add("oculto");
    document.getElementById("login").classList.remove("oculto");

    document.getElementById("form-registro").reset();
    document.getElementById("reg-mensaje").classList.add("oculto");
}

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

function actualizarPerfilEmpresa(nombre) {
    const perfil = document.querySelector(".profile-name strong");
    if (perfil) perfil.textContent = nombre;

    const almacenamiento = sessionStorage.getItem("sesion") ? sessionStorage : localStorage;
    const sesion = almacenamiento.getItem("sesion");
    if (sesion) {
        const usuario = JSON.parse(sesion);
        usuario.empresa = nombre;
        almacenamiento.setItem("sesion", JSON.stringify(usuario));
    }
}

function renderizarInicio() {
    const total = document.getElementById("inicio-productos");
    if (!total) return;
    total.textContent = productos.filter(producto => producto.activo !== false).length;
    document.getElementById("inicio-ubicaciones").textContent = ubicaciones.length;
    document.getElementById("inicio-despachos").textContent =
        despachos.filter(despacho => despacho.estado === "Pendiente").length;
}

function totalProducto(producto) {
    return Number(producto.norte || 0) + Number(producto.centro || 0) + Number(producto.sur || 0);
}

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

function filtrarTelemetria() {
    const escaner = document.getElementById("filtro-escaner").value;
    const rango = document.getElementById("rango-tiempo").value;
    const ahora = Date.now();
    const milisegundos = rango === "Últimas 24 horas"
        ? 24 * 3600000
        : rango === "Últimos 7 días" ? 7 * 24 * 3600000 : Infinity;
    const filtrados = eventosTelemetria.filter(evento =>
        (escaner === "Todos" || evento.escaner === escaner) &&
        ahora - new Date(evento.fecha).getTime() <= milisegundos
    );

    document.getElementById("telemetria-tabla").innerHTML = filtrados.length
        ? filtrados.map(evento => `<tr>
            <td>${escaparHTML(evento.escaner)}</td>
            <td>${escaparHTML(evento.tarima)}</td>
            <td>${escaparHTML(formatearFecha(evento.fecha))}</td>
            <td>${Number(evento.bateria)}%</td>
        </tr>`).join("")
        : '<tr><td colspan="4">No hay eventos para estos filtros.</td></tr>';
    document.getElementById("telemetria-resumen").textContent =
        filtrados.length + " eventos encontrados";
    document.getElementById("telemetria-alertas").innerHTML = filtrados.length
        ? filtrados.map(evento => `<div class="alert-item ${evento.evento === "ESCANEO_REGISTRADO" || evento.evento === "DESPACHO_CONFIRMADO" ? "alert-info" : "alert-warning"}">
            <div class="alert-heading">
                <strong>${escaparHTML(evento.evento)}</strong>
                <small>${escaparHTML(formatearFecha(evento.fecha))}</small>
            </div>
            <p><strong>${escaparHTML(evento.escaner)}</strong> · ${escaparHTML(evento.tarima)}</p>
            <p>${escaparHTML(evento.descripcion)}</p>
        </div>`).join("")
        : '<p>No hay alertas para estos filtros.</p>';
}

function inicializarPanel() {
    inicializarDatosPanel();
    renderizarInicio();
    renderizarProductos();
    renderizarUbicaciones();
    renderizarDespachos();
    filtrarStock();
    filtrarTelemetria();

    const sesion = sessionStorage.getItem("sesion") || localStorage.getItem("sesion");
    if (sesion) mostrarSistema(JSON.parse(sesion));
}

document.getElementById("orden-cliente").addEventListener("change", renderizarDespachos);
document.getElementById("estado-despacho").addEventListener("change", renderizarDespachos);
alCargarDOM(inicializarPanel);