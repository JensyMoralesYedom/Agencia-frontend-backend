const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../conexion");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
}

// Registro
router.post("/register", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ error: "Correo electronico no valido" });
    }

    const existe = await pool.query("SELECT id FROM usuarios WHERE correo = $1", [correo]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "El correo ya esta registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      "INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id, nombre, correo, fecha_registro",
      [nombre, correo, passwordHash]
    );

    const usuario = result.rows[0];
    const token = generarToken(usuario);

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }

    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const usuario = result.rows[0];
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = generarToken(usuario);

    res.json({
      mensaje: "Inicio de sesion exitoso",
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Invitado - token efimero (sin DB)
router.post("/guest", (req, res) => {
  const guestUser = { id: 0, nombre: "Invitado", correo: "invitado@agencia.com", isGuest: true };

  const token = jwt.sign(guestUser, process.env.JWT_SECRET, { expiresIn: "2h" });

  res.json({
    mensaje: "Acceso como invitado",
    token,
    usuario: guestUser
  });
});

// Verificar token / obtener usuario actual
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    usuario: {
      id: req.user.id,
      nombre: req.user.nombre,
      correo: req.user.correo,
      isGuest: req.user.isGuest || false
    }
  });
});

module.exports = router;
