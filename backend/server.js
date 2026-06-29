require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./conexion");
const authRoutes = require("./routes/auth");
const { authMiddleware } = require("./middleware/auth");

app.use(cors());
app.use(express.json());

// Rutas de autenticacion
app.use("/auth", authRoutes);

// Rutas de vehiculos (protegidas)
app.get("/vehiculos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vehiculos");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/vehiculos", authMiddleware, async (req, res) => {
  if (req.user.isGuest) {
    return res.status(403).json({ error: "Los invitados no pueden crear vehiculos" });
  }
  try {
    const {
      codigo, marca, modelo, anio,
      color, combustible, precio,
      cantidad, descripcion
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vehiculos 
      (codigo, marca, modelo, anio, color, combustible, precio, cantidad, descripcion)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [codigo, marca, modelo, anio, color, combustible, precio, cantidad, descripcion]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/vehiculos/:codigo", authMiddleware, async (req, res) => {
  if (req.user.isGuest) {
    return res.status(403).json({ error: "Los invitados no pueden editar vehiculos" });
  }
  try {
    const { codigo } = req.params;
    const {
      marca, modelo, anio,
      color, combustible, precio,
      cantidad, descripcion
    } = req.body;

    const result = await pool.query(
      `UPDATE vehiculos SET
      marca=$1, modelo=$2, anio=$3,
      color=$4, combustible=$5, precio=$6,
      cantidad=$7, descripcion=$8
      WHERE codigo=$9
      RETURNING *`,
      [marca, modelo, anio, color, combustible, precio, cantidad, descripcion, codigo]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/vehiculos/:codigo", authMiddleware, async (req, res) => {
  if (req.user.isGuest) {
    return res.status(403).json({ error: "Los invitados no pueden eliminar vehiculos" });
  }
  try {
    const { codigo } = req.params;

    await pool.query("DELETE FROM vehiculos WHERE codigo=$1", [codigo]);

    res.json({ message: "Vehiculo eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});
