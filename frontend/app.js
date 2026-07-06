const API_URL = "http://localhost:3000";

// ===== ELEMENTS =====
const authModal = document.getElementById("authModal");
const mainApp = document.getElementById("mainApp");
const formLogin = document.getElementById("formLogin");
const formRegister = document.getElementById("formRegister");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const registerSuccess = document.getElementById("registerSuccess");
const btnGuest = document.getElementById("btnGuest");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");
const userDisplay = document.getElementById("userDisplay");
const btnLogout = document.getElementById("btnLogout");

const formulario = document.getElementById("vehiculoForm");
const listaVehiculos = document.getElementById("listaVehiculos");

let editando = false;
let idEditar = null;

// ===== PASSWORD VALIDATION =====
const regPassword = document.getElementById("regPassword");
const regPasswordConfirm = document.getElementById("regPasswordConfirm");
const passwordReqs = document.getElementById("passwordReqs");

function validarPassword(password) {
    return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
}

function actualizarRequisitos(password) {
    const reqs = passwordReqs.querySelectorAll("small");
    const valid = validarPassword(password);

    reqs[0].className = valid.length ? "met" : "";
    reqs[1].className = valid.upper ? "met" : "";
    reqs[2].className = valid.lower ? "met" : "";
    reqs[3].className = valid.number ? "met" : "";
    reqs[4].className = valid.special ? "met" : "";
}

if (regPassword) {
    regPassword.addEventListener("focus", () => {
        passwordReqs.classList.add("visible");
    });

    regPassword.addEventListener("input", () => {
        actualizarRequisitos(regPassword.value);
    });
}

function passwordValido(password) {
    const v = validarPassword(password);
    return v.length && v.upper && v.lower && v.number && v.special;
}

// ===== TOAST =====
function showToast(mensaje, tipo = "info") {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.className = `toast ${tipo}`;
    setTimeout(() => { toast.className = "toast hidden"; }, 3000);
}

// ===== AUTH FORMS TOGGLE =====
showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("loginForm").classList.remove("active");
    document.getElementById("registerForm").classList.add("active");
});

showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("registerForm").classList.remove("active");
    document.getElementById("loginForm").classList.add("active");
});

// ===== LOGIN =====
formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.classList.remove("visible");

    const correo = document.getElementById("loginCorreo").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al iniciar sesion");

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        showToast("Inicio de sesion exitoso", "success");
        mostrarApp();
    } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.add("visible");
    }
});

// ===== REGISTER =====
formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerError.classList.remove("visible");
    registerSuccess.classList.remove("visible");

    const nombre = document.getElementById("regNombre").value;
    const correo = document.getElementById("regCorreo").value;
    const password = document.getElementById("regPassword").value;
    const passwordConfirm = document.getElementById("regPasswordConfirm").value;

    if (!passwordValido(password)) {
        registerError.textContent = "La contraseña no cumple los requisitos minimos";
        registerError.classList.add("visible");
        return;
    }

    if (password !== passwordConfirm) {
        registerError.textContent = "Las contrasenas no coinciden";
        registerError.classList.add("visible");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, correo, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al registrar");

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        registerSuccess.textContent = "Cuenta creada exitosamente";
        registerSuccess.classList.add("visible");
        showToast("Registro exitoso", "success");
        setTimeout(() => mostrarApp(), 1000);
    } catch (error) {
        registerError.textContent = error.message;
        registerError.classList.add("visible");
    }
});

// ===== GUEST =====
btnGuest.addEventListener("click", async () => {
    try {
        const res = await fetch(`${API_URL}/auth/guest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al acceder como invitado");

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        showToast("Acceso como invitado", "info");
        mostrarApp();
    } catch (error) {
        showToast(error.message, "error");
    }
});

// ===== LOGOUT =====
btnLogout.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    mainApp.classList.add("hidden");
    authModal.style.display = "flex";
    formLogin.reset();
    loginError.classList.remove("visible");
    showToast("Sesion cerrada", "info");
});

// ===== NAVIGATION =====
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        link.classList.add("active");

        const sectionId = link.getAttribute("data-section");
        document.querySelectorAll(".page-section").forEach(s => s.classList.remove("active"));
        document.getElementById(sectionId).classList.add("active");

        if (sectionId === "nuevos" || sectionId === "usados") {
            mostrarVehiculosFiltrados(sectionId === "nuevos" ? "nuevo" : "usado");
        }
    });
});

// ===== SHOW APP =====
function mostrarApp() {
    authModal.style.display = "none";
    mainApp.classList.remove("hidden");

    const user = JSON.parse(localStorage.getItem("usuario"));
    if (user) {
        if (user.isGuest) {
            userDisplay.textContent = "Invitado";
            mainApp.classList.add("guest-mode");
            document.getElementById("formulario").style.display = "none";
        } else {
            userDisplay.textContent = `Hola, ${user.nombre}`;
            mainApp.classList.remove("guest-mode");
            document.getElementById("formulario").style.display = "block";
        }
    }

    mostrarVehiculos();
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                mostrarApp();
                return;
            }
        } catch {}
    }
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    authModal.style.display = "flex";
});

// ===== VEHICULOS CRUD =====
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const vehiculo = {
        marca: document.getElementById("marca").value,
        modelo: document.getElementById("modelo").value,
        anio: parseInt(document.getElementById("anio").value),
        precio: parseFloat(document.getElementById("precio").value),
        color: document.getElementById("color").value,
        transmision: document.getElementById("transmision").value,
        combustible: document.getElementById("combustible").value,
        imagen: document.getElementById("imagen").value || null,
        descripcion: document.getElementById("descripcion").value
    };

    try {
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        };

        if (!editando) {
            const res = await fetch(`${API_URL}/vehiculos`, {
                method: "POST",
                headers,
                body: JSON.stringify(vehiculo)
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            showToast("Vehiculo registrado", "success");
        } else {
            const res = await fetch(`${API_URL}/vehiculos/${idEditar}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(vehiculo)
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            showToast("Vehiculo actualizado", "success");
            editando = false;
            idEditar = null;
        }

        formulario.reset();
        mostrarVehiculos();
    } catch (error) {
        showToast(error.message, "error");
    }
});

async function mostrarVehiculos() {
    try {
        const res = await fetch(`${API_URL}/vehiculos`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Error del servidor");
        }
        const vehiculos = await res.json();

        document.getElementById("statTotal").textContent = vehiculos.length;

        let html = "";
        vehiculos.forEach(v => {
            html += `
                <tr>
                    <td>${v.marca}</td>
                    <td>${v.modelo}</td>
                    <td>${v.anio}</td>
                    <td>$${parseFloat(v.precio).toLocaleString()}</td>
                    <td>${v.color}</td>
                    <td>${v.transmision}</td>
                    <td>${v.combustible}</td>
                    <td>
                        <button class="editar" onclick="editarVehiculo(${v.id})">Editar</button>
                        <button class="eliminar" onclick="eliminarVehiculo(${v.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        listaVehiculos.innerHTML = html || '<tr><td colspan="8" style="text-align:center">No hay vehiculos registrados</td></tr>';
    } catch (error) {
        showToast(`Error cargando vehiculos: ${error.message}`, "error");
    }
}

async function mostrarVehiculosFiltrados(tipo) {
    try {
        const res = await fetch(`${API_URL}/vehiculos`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Error del servidor");
        }
        const vehiculos = await res.json();

        const containerId = tipo === "nuevo" ? "listaNuevos" : "listaUsados";
        const container = document.getElementById(containerId);

        let html = "";
        vehiculos.forEach(v => {
            html += `
                <div class="vehicle-card">
                    ${v.imagen ? `<img src="${v.imagen}" alt="${v.marca} ${v.modelo}" class="vehicle-img">` : '<div class="vehicle-img-placeholder">Sin imagen</div>'}
                    <div class="vehicle-info">
                        <h3>${v.marca} ${v.modelo}</h3>
                        <p><strong>Anio:</strong> ${v.anio}</p>
                        <p><strong>Precio:</strong> $${parseFloat(v.precio).toLocaleString()}</p>
                        <p><strong>Color:</strong> ${v.color}</p>
                        <p><strong>Transmision:</strong> ${v.transmision}</p>
                        <p><strong>Combustible:</strong> ${v.combustible}</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p style="text-align:center; grid-column:1/-1;">No hay vehiculos disponibles</p>';
    } catch (error) {
        showToast(`Error cargando vehiculos: ${error.message}`, "error");
    }
}

async function eliminarVehiculo(id) {
    if (!confirm("Eliminar vehiculo?")) return;

    try {
        const res = await fetch(`${API_URL}/vehiculos/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error);
        }

        showToast("Vehiculo eliminado", "success");
        mostrarVehiculos();
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function editarVehiculo(id) {
    const res = await fetch(`${API_URL}/vehiculos`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    const vehiculos = await res.json();
    const vehiculo = vehiculos.find(v => v.id === id);

    document.getElementById("marca").value = vehiculo.marca;
    document.getElementById("modelo").value = vehiculo.modelo;
    document.getElementById("anio").value = vehiculo.anio;
    document.getElementById("precio").value = vehiculo.precio;
    document.getElementById("color").value = vehiculo.color;
    document.getElementById("transmision").value = vehiculo.transmision;
    document.getElementById("combustible").value = vehiculo.combustible;
    document.getElementById("imagen").value = vehiculo.imagen || "";
    document.getElementById("descripcion").value = vehiculo.descripcion;

    editando = true;
    idEditar = id;

    document.getElementById("formulario").scrollIntoView({ behavior: "smooth" });
}
