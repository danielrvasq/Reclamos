import express from "express";

import jwt from "jsonwebtoken";
import { sql, poolPromise } from "../config/server.js";
import UsuariosModel from "../models/usuariosModel.js";
import UsuarioRolesModel from "../models/usuarioRolesModel.js";
import bcryptjs from "bcryptjs"; // Ensure bcryptjs is used for hasing dummy password

import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_muy_seguro_aqui";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Debe estar en .env
const client = new OAuth2Client(CLIENT_ID);

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Usuario y contraseña son requeridos",
      });
    }

    const pool = await poolPromise;

    // Obtener usuario
    const userResult = await pool
      .request()
      .input("username", sql.NVarChar(255), username)
      .query(
        `SELECT u.id, u.nombre, u.username, u.password_hash, u.activo, u.area, u.proveedor_auth,
          u.force_password_change
         FROM usuarios u
         WHERE u.username = @username`
      );

    if (userResult.recordset.length === 0) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    const usuario = userResult.recordset[0];

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(403).json({
        message: "Usuario inhabilitado",
      });
    }

    // Comparar contraseñas
    const passwordMatch = await bcryptjs.compare(
      password,
      usuario.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    // Obtener todos los roles del usuario
    const rolesResult = await pool
      .request()
      .input("usuario_id", sql.Int, usuario.id)
      .query(
        `SELECT r.id, r.nombre
         FROM roles r
         INNER JOIN usuario_roles ur ON r.id = ur.rol_id
         WHERE ur.usuario_id = @usuario_id`
      );

    const roles = rolesResult.recordset.map((r) => r.nombre);
    const rolPrincipal = roles.length > 0 ? roles[0] : "usuario";

    // Generar JWT con todos los datos
    const token = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        area: usuario.area,
        roles: roles,
        rol_nombre: rolPrincipal,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login exitoso",
      token: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        username: usuario.username,
        area: usuario.area,
        force_password_change: !!usuario.force_password_change,
        rol_nombre: rolPrincipal,
        roles: roles,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      message: "Error al procesar el login",
      error: error.message,
    });
  }
});

// GET /api/auth/test - Endpoint para debuggeo
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes activas" });
});

// POST /api/auth/google-login
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token de Google requerido" });
    }

    // Verificar el token con Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Mismo ID que en frontend
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    const pool = await poolPromise;

    // Buscar usuario por correo
    const userResult = await pool
      .request()
      .input("email", sql.NVarChar(255), email)
      .query(
        `SELECT u.id, u.nombre, u.username, u.activo, u.area, u.proveedor_auth,
          u.force_password_change
         FROM usuarios u
         WHERE u.correo = @email`
      );

    let usuario = userResult.recordset[0];

    if (!usuario) {
      // Auto-registro
      try {
        const randomPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);
        const passwordHash = await bcryptjs.hash(randomPassword, 10);

        // Usar la parte local del correo como username (asegurar unicidad podría requerir más lógica, por ahora simple)
        let newUsername = email.split("@")[0];

        // Verificar si el username ya existe (caso raro donde correo es diferente pero username igual)
        // Por simplicidad en este paso, asumimos que email es único y username derivado también.
        // Si choca, fallará la creación (depende de constraints), pero google emails son únicos.

        usuario = await UsuariosModel.createUser({
          nombre: name || newUsername,
          correo: email,
          username: newUsername,
          passwordHash: passwordHash,
          proveedor_auth: "google",
          area_id: null,
          activo: true,
        });

        // Asignar rol de Colaborador (ID 4)
        await UsuarioRolesModel.createUserRole({
          usuario_id: usuario.id,
          rol_id: 4,
        });

        // Si llegamos aquí, usuario ya es un objeto con id, nombre, etc.
      } catch (createError) {
        console.error("Error al auto-registrar usuario:", createError);
        return res.status(500).json({
          message: "Error al registrar nuevo usuario con Google",
          error: createError.message,
        });
      }
    }

    if (!usuario.activo) {
      return res.status(403).json({
        message: "Usuario inhabilitado",
      });
    }

    // Opcional: Actualizar proveedor_auth si estaba vacío
    if (usuario.proveedor_auth !== "google") {
      await pool
        .request()
        .input("id", sql.Int, usuario.id)
        .input("provider", sql.NVarChar(50), "google")
        .query("UPDATE usuarios SET proveedor_auth = @provider WHERE id = @id");
    }

    // Obtener roles
    const rolesResult = await pool
      .request()
      .input("usuario_id", sql.Int, usuario.id)
      .query(
        `SELECT r.id, r.nombre
         FROM roles r
         INNER JOIN usuario_roles ur ON r.id = ur.rol_id
         WHERE ur.usuario_id = @usuario_id`
      );

    const roles = rolesResult.recordset.map((r) => r.nombre);
    const rolPrincipal = roles.length > 0 ? roles[0] : "usuario";

    // Generar JWT
    const jwtToken = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        area: usuario.area,
        roles: roles,
        rol_nombre: rolPrincipal,
        provider: "google",
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login exitoso con Google",
      token: jwtToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        username: usuario.username,
        area: usuario.area,
        force_password_change: !!usuario.force_password_change,
        rol_nombre: rolPrincipal,
        roles: roles,
        googleId: googleId,
      },
    });
  } catch (error) {
    console.error("Error en google-login:", error);
    res.status(500).json({
      message: "Error al procesar el login con Google",
      error: error.message,
    });
  }
});

// Middleware para verificar token (uso futuro)
export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No autorizado - Token requerido",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};

export default router;
