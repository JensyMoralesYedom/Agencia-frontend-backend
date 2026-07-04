const Vehiculo = require("../models/vehiculos");

exports.listar = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.listar();
    res.json(vehiculos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.crear = async (req, res) => {
  if (req.user.isGuest) {
    return res.status(403).json({ error: "Los invitados no pueden crear vehiculos" });
  }
  try {
    const { marca, modelo, anio, precio, color, transmision, combustible, descripcion, imagen } = req.body;

    const vehiculo = await Vehiculo.crear({ marca, modelo, anio, precio, color, transmision, combustible, descripcion, imagen });
    res.json(vehiculo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.actualizar = async (req, res) => {
  if (req.user.isGuest) {
    return res.status(403).json({ error: "Los invitados no pueden editar vehiculos" });
  }
  try {
    const { id } = req.params;
    const { marca, modelo, anio, precio, color, transmision, combustible, descripcion, imagen } = req.body;

    const vehiculo = await Vehiculo.actualizar(id, { marca, modelo, anio, precio, color, transmision, combustible, descripcion, imagen });
    res.json(vehiculo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.eliminar = async (req, res) => {
  if (req.user.isGuest) {
    return res.status(403).json({ error: "Los invitados no pueden eliminar vehiculos" });
  }
  try {
    const { id } = req.params;
    await Vehiculo.eliminar(id);
    res.json({ message: "Vehiculo eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
