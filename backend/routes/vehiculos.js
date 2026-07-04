const express = require("express");
const vehiculosController = require("../controllers/vehiculosController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/", vehiculosController.listar);
router.post("/", authMiddleware, vehiculosController.crear);
router.put("/:id", authMiddleware, vehiculosController.actualizar);
router.delete("/:id", authMiddleware, vehiculosController.eliminar);

module.exports = router;
