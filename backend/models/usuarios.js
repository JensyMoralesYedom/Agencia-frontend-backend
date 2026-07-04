const pool = require("../config/database");

const Usuario = {
  async buscarPorCorreo(correo) {
    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
    return result.rows[0];
  },

  async crear(nombre, correo, passwordHash) {
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id, nombre, correo, fecha_registro",
      [nombre, correo, passwordHash]
    );
    return result.rows[0];
  },

  async existeCorreo(correo) {
    const result = await pool.query("SELECT id FROM usuarios WHERE correo = $1", [correo]);
    return result.rows.length > 0;
  },
};

module.exports = Usuario;
