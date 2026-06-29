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
let codigoEditar = null;

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
        await Auth.login(correo, password);
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
        await Auth.register(nombre, correo, password);
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
        await Auth.guestLogin();
        showToast("Acceso como invitado", "info");
        mostrarApp();
    } catch (error) {
        showToast(error.message, "error");
    }
});

// ===== LOGOUT =====
btnLogout.addEventListener("click", () => {
    Auth.logout();
    mainApp.classList.add("hidden");
    authModal.style.display = "flex";
    formLogin.reset();
    loginError.classList.remove("visible");
    showToast("Sesion cerrada", "info");
});

// ===== SHOW APP =====
function mostrarApp() {
    authModal.style.display = "none";
    mainApp.classList.remove("hidden");

    const user = Auth.getUsuario();
    if (user) {
        userDisplay.textContent = `Hola, ${user.nombre}`;
    }

    if (Auth.isGuest()) {
        mainApp.classList.add("guest-mode");
        const banner = document.createElement("div");
        banner.className = "guest-banner";
        banner.textContent = "Modo Invitado - Solo lectura. Registrate para acceder a todas las funciones.";
        mainApp.insertBefore(banner, mainApp.firstChild);
        document.getElementById("formulario").style.display = "none";
    } else {
        mainApp.classList.remove("guest-mode");
        document.getElementById("formulario").style.display = "block";
        const existingBanner = mainApp.querySelector(".guest-banner");
        if (existingBanner) existingBanner.remove();
    }

    mostrarVehiculos();
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
    const usuario = await Auth.verificarToken();
    if (usuario) {
        mostrarApp();
    } else {
        authModal.style.display = "flex";
    }
});

// ===== VEHICULOS CRUD =====
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const vehiculo = {
        codigo: document.getElementById("codigo").value,
        marca: document.getElementById("marca").value,
        modelo: document.getElementById("modelo").value,
        anio: parseInt(document.getElementById("anio").value),
        color: document.getElementById("color").value,
        combustible: document.getElementById("combustible").value,
        precio: parseFloat(document.getElementById("precio").value),
        cantidad: parseInt(document.getElementById("cantidad").value),
        descripcion: document.getElementById("descripcion").value
    };

    try {
        const headers = {
            "Content-Type": "application/json",
            ...Auth.getAuthHeaders()
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
            const res = await fetch(`${API_URL}/vehiculos/${codigoEditar}`, {
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
            codigoEditar = null;
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
            headers: Auth.getAuthHeaders()
        });
        const vehiculos = await res.json();

        let html = "";
        vehiculos.forEach(v => {
            html += `
                <tr>
                    <td>${v.codigo}</td>
                    <td>${v.marca}</td>
                    <td>${v.modelo}</td>
                    <td>${v.anio}</td>
                    <td>${v.color}</td>
                    <td>${v.combustible}</td>
                    <td>${v.precio}</td>
                    <td>${v.cantidad}</td>
                    <td>
                        <button class="editar" onclick="editarVehiculo('${v.codigo}')">Editar</button>
                        <button class="eliminar" onclick="eliminarVehiculo('${v.codigo}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        listaVehiculos.innerHTML = html;
    } catch (error) {
        showToast("Error cargando vehiculos", "error");
    }
}

async function eliminarVehiculo(codigo) {
    if (!confirm("Eliminar vehiculo?")) return;

    try {
        const res = await fetch(`${API_URL}/vehiculos/${codigo}`, {
            method: "DELETE",
            headers: Auth.getAuthHeaders()
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

async function editarVehiculo(codigo) {
    const res = await fetch(`${API_URL}/vehiculos`, {
        headers: Auth.getAuthHeaders()
    });
    const vehiculos = await res.json();
    const vehiculo = vehiculos.find(v => v.codigo === codigo);

    document.getElementById("codigo").value = vehiculo.codigo;
    document.getElementById("marca").value = vehiculo.marca;
    document.getElementById("modelo").value = vehiculo.modelo;
    document.getElementById("anio").value = vehiculo.anio;
    document.getElementById("color").value = vehiculo.color;
    document.getElementById("combustible").value = vehiculo.combustible;
    document.getElementById("precio").value = vehiculo.precio;
    document.getElementById("cantidad").value = vehiculo.cantidad;
    document.getElementById("descripcion").value = vehiculo.descripcion;

    editando = true;
    codigoEditar = codigo;
}
