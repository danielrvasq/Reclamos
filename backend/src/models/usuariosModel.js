import { sql, poolPromise } from "../config/server.js";

class UsuariosModel {
  // Obtener todos los usuarios (sin exponer hashes)
  static async getAllUsers() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT id, nombre, correo, username, proveedor_auth, area, activo, force_password_change, created_at
         FROM usuarios
         ORDER BY id DESC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener usuarios: ${err.message}`);
    }
  }

  // Obtener usuario por ID
  static async getUserById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT id, nombre, correo, username, proveedor_auth, area, activo, force_password_change, created_at
           FROM usuarios
           WHERE id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener usuario: ${err.message}`);
    }
  }

  // Obtener usuarios por IDs
  static async getUsersByIds(ids = []) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) return [];
      const pool = await poolPromise;
      const request = pool.request();
      const params = ids.map((id, index) => {
        const paramName = `id${index}`;
        request.input(paramName, sql.Int, id);
        return `@${paramName}`;
      });

      const result = await request.query(
        `SELECT id, nombre, correo, username, proveedor_auth, area, activo, created_at
         FROM usuarios
         WHERE id IN (${params.join(", ")})`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener usuarios por IDs: ${err.message}`);
    }
  }

  // Obtener usuario por correo (para Google Login)
  static async getUserByEmail(email) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("email", sql.NVarChar(255), email)
        .query(
          `SELECT id, nombre, correo, username, proveedor_auth, area, activo, force_password_change, created_at
           FROM usuarios
           WHERE correo = @email`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener usuario por correo: ${err.message}`);
    }
  }

  // Crear nuevo usuario
  static async createUser(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("nombre", sql.NVarChar(255), data.nombre)
        .input("correo", sql.NVarChar(255), data.correo || null)
        .input("username", sql.NVarChar(255), data.username)
        .input("passwordHash", sql.NVarChar(255), data.passwordHash)
        .input("proveedorAuth", sql.NVarChar(255), data.proveedor_auth || null)
        .input("areaId", sql.Int, data.area_id || null)
        .input("activo", sql.Bit, data.activo ?? true)
        .query(
          `INSERT INTO usuarios (nombre, correo, username, password_hash, proveedor_auth, area, activo, created_at)
           VALUES (@nombre, @correo, @username, @passwordHash, @proveedorAuth, @areaId, @activo, GETDATE());
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getUserById(newId);
    } catch (err) {
      throw new Error(`Error al crear usuario: ${err.message}`);
    }
  }

  // Actualizar usuario
  static async updateUser(id, data) {
    try {
      const pool = await poolPromise;

      const setClauses = [
        "nombre = @nombre",
        "correo = @correo",
        "username = @username",
        "proveedor_auth = @proveedorAuth",
        "area = @areaId",
      ];

      if (data.passwordHash) {
        setClauses.push("password_hash = @passwordHash");
      }

      if (
        data.force_password_change !== undefined &&
        data.force_password_change !== null
      ) {
        setClauses.push("force_password_change = @forcePasswordChange");
      }

      if (data.activo !== undefined && data.activo !== null) {
        setClauses.push("activo = @activo");
      }

      const query = `UPDATE usuarios SET ${setClauses.join(
        ", "
      )} WHERE id = @id`;

      const request = pool
        .request()
        .input("id", sql.Int, id)
        .input("nombre", sql.NVarChar(255), data.nombre)
        .input("correo", sql.NVarChar(255), data.correo || null)
        .input("username", sql.NVarChar(255), data.username)
        .input("proveedorAuth", sql.NVarChar(255), data.proveedor_auth || null)
        .input("areaId", sql.Int, data.area_id || null)
        .input("passwordHash", sql.NVarChar(255), data.passwordHash || null)
        .input(
          "forcePasswordChange",
          sql.Bit,
          data.force_password_change ?? null
        );

      if (data.activo !== undefined && data.activo !== null) {
        request.input("activo", sql.Bit, data.activo);
      }

      await request.query(query);

      return await this.getUserById(id);
    } catch (err) {
      throw new Error(`Error al actualizar usuario: ${err.message}`);
    }
  }

  // Actualizar contraseña (y resetear force_password_change)
  static async updatePassword(id, passwordHash, forcePasswordChange = false) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("passwordHash", sql.NVarChar(255), passwordHash)
        .input("forcePasswordChange", sql.Bit, forcePasswordChange)
        .query(
          `UPDATE usuarios
           SET password_hash = @passwordHash,
               force_password_change = @forcePasswordChange
           WHERE id = @id`
        );

      return await this.getUserById(id);
    } catch (err) {
      throw new Error(`Error al actualizar contraseña: ${err.message}`);
    }
  }

  // Eliminar usuario
  static async deleteUser(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM usuarios WHERE id = @id");
      return { message: "Usuario eliminado correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar usuario: ${err.message}`);
    }
  }
}

export default UsuariosModel;
