let tareas = [];
let idTareaActual = null;

document.getElementById("btnAgregarTarea").onclick = () => abrirModal();
document.querySelector(".cerrar").onclick = () => cerrarModal();

function abrirModal(tarea = null) {
    let modal = document.getElementById("modalTarea");
    modal.style.display = "block";
    if (tarea) {
        idTareaActual = tarea.id;
        document.getElementById("tituloTarea").value = tarea.titulo;
        document.getElementById("descripcionTarea").value = tarea.descripcion;
        document.getElementById("fechaVencimientoTarea").value = tarea.fechaVencimiento || "";
    } else {
        idTareaActual = null;
        document.getElementById("formularioTarea").reset();
    }
}

function cerrarModal() {
    document.getElementById("modalTarea").style.display = "none";
}

document.getElementById("formularioTarea").onsubmit = (event) => {
    event.preventDefault();
    let titulo = document.getElementById("tituloTarea").value;
    let descripcion = document.getElementById("descripcionTarea").value;
    let fechaVencimiento = document.getElementById("fechaVencimientoTarea").value;

    if (idTareaActual) {
        actualizarTarea(idTareaActual, titulo, descripcion, fechaVencimiento);
    } else {
        agregarTarea(titulo, descripcion, fechaVencimiento);
    }

    cerrarModal();
    renderizarTareas();
};

function agregarTarea(titulo, descripcion, fechaVencimiento) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "api/tareas.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                let data;
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (e) {
                    console.error("Error al parsear la respuesta JSON:", e);
                    return;
                }
                if (data.success) {
                    tareas.push(data.tarea);
                    renderizarTareas();
                } else {
                    console.error(data.message);
                }
            } else {
                console.error("Error:", xhr.statusText);
            }
        }
    };

    xhr.onerror = function() {
        console.error("Error");
    };

    xhr.send(JSON.stringify({ titulo, descripcion, fechaVencimiento }));
}

function actualizarTarea(id, titulo, descripcion, fechaVencimiento) {
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", `api/tareas.php?id=${id}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                let data;
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (e) {
                    console.error("Error al parsear la respuesta JSON:", e);
                    return;
                }
                if (data.success) {
                    let tarea = tareas.find(t => t.id === id);
                    if (tarea) {
                        tarea.titulo = titulo;
                        tarea.descripcion = descripcion;
                        tarea.fechaVencimiento = fechaVencimiento;
                        renderizarTareas();
                    }
                } else {
                    console.error(data.message);
                }
            } else {
                console.error("Error:", xhr.statusText);
            }
        }
    };

    xhr.onerror = function() {
        console.error("Error");
    };

    xhr.send(JSON.stringify({ titulo, descripcion, fechaVencimiento }));
}

function eliminarTarea(id) {
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", `api/tareas.php?id=${id}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                let data;
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (e) {
                    console.error("Error al parsear la respuesta JSON:", e);
                    return;
                }
                if (data.success) {
                    tareas = tareas.filter(t => t.id !== id);
                    renderizarTareas();
                } else {
                    console.error(data.message);
                }
            } else {
                console.error("Error:", xhr.statusText);
            }
        }
    };

    xhr.onerror = function() {
        console.error("Error");
    };

    xhr.send();
}

function renderizarTareas() {
    let pendienteTareas = document.getElementById("pendienteTareas");
    let enProgresoTareas = document.getElementById("enProgresoTareas");
    let finalizadaTareas = document.getElementById("finalizadaTareas");

    if (!pendienteTareas || !enProgresoTareas || !finalizadaTareas) {
        console.error("Uno o más elementos de la lista de tareas no encontrados");
        return;
    }

    pendienteTareas.innerHTML = "";
    enProgresoTareas.innerHTML = "";
    finalizadaTareas.innerHTML = "";

    tareas.forEach(tarea => {
        let tareaElemento = document.createElement("div");
        tareaElemento.className = "tarea";
        tareaElemento.draggable = true;
        tareaElemento.ondragstart = (event) => arrastrar(event, tarea.id);

        let tareaTitulo = document.createElement("strong");
        tareaTitulo.innerText = tarea.titulo;
        tareaElemento.appendChild(tareaTitulo);

        let tareaDescripcion = document.createElement("p");
        tareaDescripcion.innerText = tarea.descripcion;
        tareaElemento.appendChild(tareaDescripcion);

        if (tarea.fechaVencimiento) {
            let fecha = new Date(tarea.fechaVencimiento);
            let fechaFormateada = `${fecha.getDate().toString().padStart(2, "0")}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}-${fecha.getFullYear()}`;
            let tareaFecha = document.createElement("p");
            tareaFecha.innerText = `Fecha de vencimiento: ${fechaFormateada}`;
            tareaElemento.appendChild(tareaFecha);
        }

        let botonesContainer = document.createElement("div");
        botonesContainer.className = "grupo-botones";

        let editButton = document.createElement("button");
        editButton.className = "btn-editar";
        editButton.innerText = "Editar";
        editButton.onclick = () => abrirModal(tarea);
        botonesContainer.appendChild(editButton);

        let deleteButton = document.createElement("button");
        deleteButton.className = "btn-eliminar";
        deleteButton.innerText = "Eliminar";
        deleteButton.onclick = () => eliminarTarea(tarea.id);
        botonesContainer.appendChild(deleteButton);

        tareaElemento.appendChild(botonesContainer);

        if (tarea.estado === "pendiente") {
            pendienteTareas.appendChild(tareaElemento);
        } else if (tarea.estado === "en progreso") {
            enProgresoTareas.appendChild(tareaElemento);
        } else if (tarea.estado === "finalizada") {
            finalizadaTareas.appendChild(tareaElemento);
        }
    });
}

function verificarSesion() {
    let expiracion = localStorage.getItem("expiracion");
    if (!expiracion) return;

    let ahora = new Date();
    let fechaExpiracion = new Date(expiracion);
    let segundosRestantes = Math.round((fechaExpiracion - ahora) / 1000);

    if (segundosRestantes <= 0) {
        localStorage.clear();
        window.location.href = "login.html";
    } else if (segundosRestantes <= 30) {
        alert(`¡Atención! Tu sesión expirará en ${segundosRestantes} segundos`);
    }
}

setInterval(verificarSesion, 1000);

function arrastrar(event, id) {
    event.dataTransfer.setData("text", id);
}

function permitirSoltar(event) {
    event.preventDefault();
}

function soltar(event) {
    event.preventDefault();
    let id = event.dataTransfer.getData("text");
    let nuevaColumna = event.target.closest(".columna").id;

    let tarea = tareas.find(t => t.id === id);
    if (tarea) {
        let estadoActual = tarea.estado;
        let nuevoEstado = "";

        if (nuevaColumna === "pendiente") {
            nuevoEstado = "pendiente";
        } else if (nuevaColumna === "enProgreso") {
            nuevoEstado = "en progreso";
        } else if (nuevaColumna === "finalizada") {
            nuevoEstado = "finalizada";
        }

        if ((estadoActual === "pendiente" && nuevoEstado === "finalizada") ||
            (estadoActual === "finalizada" && nuevoEstado === "en progreso")) {
            alert("No puedes mover la tarea a esta columna");
            return;
        }

        tarea.estado = nuevoEstado;
        actualizarTarea(tarea.id, tarea.titulo, tarea.descripcion, tarea.fechaVencimiento);
    }
}

// Cargar tareas al iniciar
let xhr = new XMLHttpRequest();
xhr.open("GET", "api/tareas.php", true);
xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);

xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
            let contentType = xhr.getResponseHeader("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                let data;
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (e) {
                    console.error("Error al parsear la respuesta JSON:", e);
                    return;
                }
                if (data.success) {
                    tareas = data.tareas;
                    renderizarTareas();
                } else {
                    console.error(data.message);
                }
            } else {
                console.error("Respuesta no es JSON");
            }
        } else {
            console.error("Error:", xhr.statusText);
        }
    }
};

xhr.onerror = function() {
    console.error("Error");
};

xhr.send();
