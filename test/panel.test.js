const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const appSource = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");
const valoresIniciales = {
    "orden-cliente": "PED-2026-018",
    "estado-despacho": "todos",
    "filtro-escaner": "Todos",
    "rango-tiempo": "Últimas 24 horas",
    "consulta-tipo": "tarima"
};

class ElementMock {
    constructor(id) {
        this.id = id;
        this.value = valoresIniciales[id] || "";
        this.textContent = "";
        this.innerHTML = "";
        this.dataset = {};
        this.disabled = false;
        this.checked = false;
        this.type = id === "reg-terminos" ? "checkbox" : "text";
        this.classList = {
            add() {},
            remove() {},
            toggle() {}
        };
    }

    addEventListener() {}
    focus() {}
    reset() {}
}

function createStorage() {
    const values = new Map();
    return {
        values,
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        },
        removeItem(key) {
            values.delete(key);
        }
    };
}

function loadApp() {
    const elements = new Map();
    const document = {
        readyState: "loading",
        getElementById(id) {
            if (!elements.has(id)) elements.set(id, new ElementMock(id));
            return elements.get(id);
        },
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
        addEventListener() {}
    };
    const context = {
        document,
        localStorage: createStorage(),
        sessionStorage: createStorage(),
        alert() {},
        confirm() {
            return true;
        },
        console,
        Date,
        Intl,
        Set
    };

    vm.createContext(context);
    vm.runInContext(appSource, context);

    return {
        context,
        elements,
        run(source) {
            return vm.runInContext(source, context);
        }
    };
}

test("initializes and renders locally stored catalog data", () => {
    const app = loadApp();
    app.run("inicializarPanel()");

    assert.equal(app.run("productos.length"), 3);
    assert.equal(app.run("ubicaciones.length"), 3);
    assert.equal(app.elements.get("productos-total").textContent, 3);
    assert.match(app.elements.get("productos-tabla").innerHTML, /PRO-001/);
    assert.ok(app.context.localStorage.getItem("pallettrack.productos.v1"));
});

test("saves new products and locations to localStorage", () => {
    const app = loadApp();
    app.run("inicializarPanel()");
    app.run(`
        document.getElementById("producto-sku").value = "PRO-004";
        document.getElementById("producto-nombre").value = "Producto de prueba";
        document.getElementById("producto-unidad").value = "Pieza";
        document.getElementById("producto-norte").value = "5";
        document.getElementById("producto-centro").value = "0";
        document.getElementById("producto-sur").value = "0";
        guardarProducto({
            preventDefault() {},
            currentTarget: document.getElementById("form-producto")
        });
        document.getElementById("ubicacion-codigo").value = "UBI-004";
        document.getElementById("ubicacion-zona").value = "Zona D";
        document.getElementById("ubicacion-rack").value = "Rack 05";
        document.getElementById("ubicacion-nivel").value = "Nivel 01";
        guardarUbicacion({
            preventDefault() {},
            currentTarget: document.getElementById("form-ubicacion")
        });
    `);

    assert.equal(app.run("productos.length"), 4);
    assert.equal(app.run("ubicaciones.length"), 4);
    assert.match(app.context.localStorage.getItem("pallettrack.productos.v1"), /PRO-004/);
    assert.match(app.context.localStorage.getItem("pallettrack.ubicaciones.v1"), /UBI-004/);
});

test("confirms a dispatch once, decrements stock, and records traceability", () => {
    const app = loadApp();
    app.run("inicializarPanel()");
    app.run(`
        document.getElementById("codigo-tarima").value = "PAL-2026-001";
        validarTarima();
    `);

    assert.equal(app.elements.get("confirmar-despacho").disabled, false);
    app.run("confirmarDespacho()");
    assert.equal(app.run("despachos.find(item => item.codigo === 'PAL-2026-001').estado"), "Despachada");
    assert.equal(app.run("productos.find(item => item.sku === 'PRO-001').norte"), 59);

    app.run(`
        document.getElementById("consulta-codigo").value = "PAL-2026-001";
        consultarTrazabilidad();
        filtrarStock();
        filtrarTelemetria();
    `);
    assert.match(app.elements.get("trazabilidad-tabla").innerHTML, /Despacho/);
    assert.match(app.elements.get("stock-tabla").innerHTML, /59/);
    assert.match(app.elements.get("telemetria-tabla").innerHTML, /PAL-2026-001/);
});
