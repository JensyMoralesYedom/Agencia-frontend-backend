const express = require("express");
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.registrar);
router.post("/login", authController.login);
router.post("/guest", authController.invitado);
router.get("/me", authMiddleware, authController.verificarToken);

module.exports = router;
