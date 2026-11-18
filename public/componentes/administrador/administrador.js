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
