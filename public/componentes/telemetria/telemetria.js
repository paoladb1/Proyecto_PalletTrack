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
