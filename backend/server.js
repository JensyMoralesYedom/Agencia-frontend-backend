require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth");
const vehiculosRoutes = require("./routes/vehiculos");

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/vehiculos", vehiculosRoutes);

app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});
