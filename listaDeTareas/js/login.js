document.getElementById("formularioLogin").onsubmit = function(event) {
    event.preventDefault();
    let usuario = document.getElementById("usuario").value;
    let contrasena = document.getElementById("contrasena").value;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "api/login.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");

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
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("expiracion", data.expiracion);
                    window.location.href = "index.html";
                } else {
                    document.getElementById("mensajeError").innerText = data.message;
                }
            } else {
                console.error("Error:", xhr.statusText);
            }
        }
    };

    xhr.onerror = function() {
        console.error("Error");
    };

    xhr.send(JSON.stringify({ usuario, contrasena }));
};
