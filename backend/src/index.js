import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { sql, poolPromise } from "./config/server.js";
import authRoutes from "./routes/authRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import usuarioRolesRoutes from "./routes/usuarioRolesRoutes.js";
import productosRoutes from "./routes/productosRoutes.js";
import tiposProductoRoutes from "./routes/tiposProductoRoutes.js";
import slaEstadosRoutes from "./routes/slaEstadosRoutes.js";
import registrosRoutes from "./routes/registrosRoutes.js";
import matrizDireccionamientoRoutes from "./routes/matrizDireccionamientoRoutes.js";
import historialEstadosRoutes from "./routes/historialEstadosRoutes.js";
import formulariosRoutes from "./routes/formulariosRoutes.js";
import flujoEstadosRoutes from "./routes/flujoEstadosRoutes.js";
import estadosReclamoRoutes from "./routes/estadosReclamoRoutes.js";
import clasificacionesMatrizRoutes from "./routes/clasificacionesMatrizRoutes.js";
import clasesMatrizRoutes from "./routes/clasesMatrizRoutes.js";
import causasMatrizRoutes from "./routes/causasMatrizRoutes.js";
import areaRoutes from "./routes/areaRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta de prueba - Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor backend activo" });
});

// Ruta de prueba de conexión a BD
app.get("/api/db-test", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT 1 as test");
    res.json({
      status: "connected",
      message: "Conexión exitosa a SQL Server",
      data: result.recordset,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error de conexión a la base de datos",
      error: err.message,
    });
  }
});

// Rutas de API
// Rutas públicas
app.use("/api/auth", authRoutes);

app.use(authMiddleware);

// Rutas protegidas por JWT
app.use("/api/roles", rolesRoutes);
app.use("/api/area", areaRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/usuario-roles", usuarioRolesRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/tipos-producto", tiposProductoRoutes);
app.use("/api/sla-estados", slaEstadosRoutes);
app.use("/api/registros", registrosRoutes);
app.use("/api/matriz-direccionamiento", matrizDireccionamientoRoutes);
app.use("/api/historial-estados", historialEstadosRoutes);
app.use("/api/reclamos", formulariosRoutes);
app.use("/api/flujo-estados", flujoEstadosRoutes);
app.use("/api/estados-reclamo", estadosReclamoRoutes);
app.use("/api/clasificaciones-matriz", clasificacionesMatrizRoutes);
app.use("/api/clases-matriz", clasesMatrizRoutes);
app.use("/api/causas-matriz", causasMatrizRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Prueba la conexión en http://localhost:${PORT}/api/db-test`);
});

export default app;
