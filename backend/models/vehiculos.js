const pool = require("../config/database");

const Vehiculo = {
  async listar() {
    const result = await pool.query("SELECT * FROM vehiculos ORDER BY id DESC");
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query("SELECT * FROM vehiculos WHERE id = $1", [id]);
    return result.rows[0];
  },

  async crear({ marca, modelo, anio, precio, color, transmision, combustible, descripcion, imagen }) {
    const result = await pool.query(
      `INSERT INTO vehiculos (marca, modelo, anio, precio, color, transmision, combustible, descripcion, imagen)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [marca, modelo, anio, precio, color, transmision, combustible, descripcion, imagen]
    );
    return result.rows[0];
  },

  async actualizar(id, { marca, modelo, anio, precio, color, transmision, combustible, descripcion, imagen }) {
    const result = await pool.query(
      `UPDATE vehiculos SET
       marca=$1, modelo=$2, anio=$3, precio=$4, color=$5,
       transmision=$6, combustible=$7, descripcion=$8, imagen=$9
       WHERE id=$10
       RETURNING *`,
      [marca, modelo, anio, precio, color, transmision, combustible, descripcion, imagen, id]
    );
    return result.rows[0];
  },

  async eliminar(id) {
    await pool.query("DELETE FROM vehiculos WHERE id = $1", [id]);
  },
};

module.exports = Vehiculo;
