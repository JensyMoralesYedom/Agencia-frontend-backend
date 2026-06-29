const API_URL = "http://localhost:3000";

const Auth = {
  getToken() {
    return localStorage.getItem("token");
  },

  getUsuario() {
    const data = localStorage.getItem("usuario");
    return data ? JSON.parse(data) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  isGuest() {
    const user = this.getUsuario();
    return user && user.isGuest;
  },

  async register(nombre, correo, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al registrar");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    return data;
  },

  async login(correo, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al iniciar sesion");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    return data;
  },

  async guestLogin() {
    const res = await fetch(`${API_URL}/auth/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al acceder como invitado");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    return data;
  },

  async verificarToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        this.logout();
        return null;
      }

      const data = await res.json();
      return data.usuario;
    } catch {
      this.logout();
      return null;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  },

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { "Authorization": `Bearer ${token}` } : {};
  }
};
