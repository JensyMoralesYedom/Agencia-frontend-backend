const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuarios");

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
}

exports.registrar = async (req, res) => {
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

    const existe = await Usuario.existeCorreo(correo);
    if (existe) {
      return res.status(409).json({ error: "El correo ya esta registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const usuario = await Usuario.crear(nombre, correo, passwordHash);
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
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }

    const usuario = await Usuario.buscarPorCorreo(correo);
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

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
};

exports.invitado = (req, res) => {
  const guestUser = { id: 0, nombre: "Invitado", correo: "invitado@agencia.com", isGuest: true };
  const token = jwt.sign(guestUser, process.env.JWT_SECRET, { expiresIn: "2h" });

  res.json({
    mensaje: "Acceso como invitado",
    token,
    usuario: guestUser
  });
};

exports.verificarToken = (req, res) => {
  res.json({
    usuario: {
      id: req.user.id,
      nombre: req.user.nombre,
      correo: req.user.correo,
      isGuest: req.user.isGuest || false
    }
  });
};
