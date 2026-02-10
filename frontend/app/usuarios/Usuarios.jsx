"use client";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Calendar, RotateCcw } from "lucide-react";
import UserForm from "./UserForm";
import Toast from "../common/Toast";
import { authFetch } from "../utils/authFetch";
import "./Usuarios.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-CO") : "—");
  const fmtTs = (d) => (d ? new Date(d).toLocaleString("es-CO") : "—");

  const roleClass = () => "tag tag-role";

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const getAreaNombre = (areaId) => {
    if (!areaId) return "—";
    const area = areas.find((a) => a.id === areaId);
    return area ? area.nombre : "—";
  };

  const mapFromApi = (u, rolesByUser = {}) => {
    const rolesUsuario = rolesByUser[u.id] || [];
    return {
      id: u.id,
      nombre_completo: u.nombre,
      usuario: u.username,
      email: u.correo,
      area_id: u.area || null,
      rol: rolesUsuario[0]?.rol_nombre || "Sin rol",
      rol_id: rolesUsuario[0]?.rol_id || null,
      roles: rolesUsuario,
      estado: u.activo ? "activo" : "inactivo",
      fecha_creacion: u.created_at,
      ultimo_acceso: u.ultimo_acceso || null,
    };
  };

  const buildPayload = (user, overrideActivo) => {
    const isActivo =
      overrideActivo !== undefined
        ? overrideActivo
        : user.estado !== "inactivo";

    return {
      nombre: user.nombre_completo || user.nombre,
      correo: user.email || user.correo,
      username: user.usuario || user.username,
      proveedor_auth: user.proveedor_auth || null,
      area_id: user.area_id || null,
      activo: isActivo,
      ...(user.password ? { password: user.password } : {}),
    };
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, areasRes, usersRes] = await Promise.all([
        authFetch(`${API_BASE}/roles`),
        authFetch(`${API_BASE}/area`),
        authFetch(`${API_BASE}/usuarios`),
      ]);

      const rolesJson = await rolesRes.json();
      const areasJson = await areasRes.json();
      const usersJson = await usersRes.json();

      if (!rolesRes.ok) {
        throw new Error(rolesJson.message || "No se pudieron cargar los roles");
      }
      if (!areasRes.ok) {
        throw new Error(areasJson.message || "No se pudieron cargar las áreas");
      }
      if (!usersRes.ok) {
        throw new Error(
          usersJson.message || "No se pudieron cargar los usuarios",
        );
      }

      const rolesData = rolesJson.data || [];
      const areasData = areasJson.data || [];
      setRoles(rolesData);
      setAreas(areasData);

      // Obtener roles por usuario
      const rolesByUser = {};
      await Promise.all(
        (usersJson.data || []).map(async (u) => {
          try {
            const rRes = await authFetch(
              `${API_BASE}/usuario-roles/usuario/${u.id}`,
            );
            const rJson = await rRes.json();
            rolesByUser[u.id] = rRes.ok ? rJson.data || [] : [];
          } catch (e) {
            rolesByUser[u.id] = [];
          }
        }),
      );

      const mappedUsers = (usersJson.data || []).map((u) =>
        mapFromApi(u, rolesByUser),
      );

      // Ordenar por nombre de área alfabéticamente
      mappedUsers.sort((a, b) => {
        const areaNameA =
          areasData.find((area) => area.id === a.area_id)?.nombre || "";
        const areaNameB =
          areasData.find((area) => area.id === b.area_id)?.nombre || "";
        return areaNameA.localeCompare(areaNameB);
      });

      setUsers(mappedUsers);
    } catch (err) {
      showToast(err.message || "Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const normalize = (value) => (value || "").toString().toLowerCase();
  const matchesSearch = (user) => {
    const term = normalize(searchTerm).trim();
    if (!term) return true;
    return [
      user.nombre_completo,
      user.usuario,
      user.email,
      user.rol,
      getAreaNombre(user.area_id),
    ].some((field) => normalize(field).includes(term));
  };

  // Separar usuarios activos e inactivos
  const activos = users.filter(
    (u) => u.estado === "activo" && matchesSearch(u)
  );
  const inactivos = users.filter(
    (u) => u.estado === "inactivo" && matchesSearch(u)
  );

  const syncUserRole = async (userId, roleId) => {
    if (!roleId || !userId) return;
    const delRes = await authFetch(
      `${API_BASE}/usuario-roles/usuario/${userId}/all`,
      {
        method: "DELETE",
      },
    );
    if (!delRes.ok) {
      throw new Error("No se pudo limpiar roles previos");
    }
    const addRes = await authFetch(`${API_BASE}/usuario-roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id: userId, rol_id: roleId }),
    });
    if (!addRes.ok) {
      const j = await addRes.json().catch(() => ({}));
      throw new Error(j.message || "No se pudo asignar el rol");
    }
  };

  const upsertUser = async (user) => {
    try {
      const isEdit = Boolean(editingUser);
      const url = isEdit
        ? `${API_BASE}/usuarios/${editingUser.id}`
        : `${API_BASE}/usuarios`;
      const method = isEdit ? "PUT" : "POST";
      const payload = buildPayload(user);

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "No se pudo guardar el usuario");
      }

      const savedUser = json.data;

      // Sincronizar rol
      if (user.rol_id) {
        await syncUserRole(savedUser.id, user.rol_id || user.rol?.rol_id);
      }

      // Reconsultar roles de ese usuario
      let rolesUsuario = [];
      try {
        const rRes = await authFetch(
          `${API_BASE}/usuario-roles/usuario/${savedUser.id}`,
        );
        const rJson = await rRes.json();
        rolesUsuario = rRes.ok ? rJson.data || [] : [];
      } catch (e) {
        rolesUsuario = [];
      }

      const saved = mapFromApi(savedUser, { [savedUser.id]: rolesUsuario });

      setUsers((prev) => {
        if (isEdit) {
          return prev.map((u) => (u.id === saved.id ? saved : u));
        }
        return [saved, ...prev];
      });

      setShowForm(false);
      setEditingUser(null);
      showToast(isEdit ? "Usuario actualizado" : "Usuario creado");
    } catch (err) {
      showToast(err.message || "Error guardando usuario");
    }
  };

  // Manejar eliminación (se inactiva en BD)
  const handleDelete = async (idx, isActive) => {
    const user = isActive ? activos[idx] : inactivos[idx];
    if (!user?.id) return;

    try {
      const payload = buildPayload(user, false);
      const res = await authFetch(`${API_BASE}/usuarios/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "No se pudo inactivar el usuario");
      }
      showToast("Usuario movido a inactivos");
      fetchUsers();
    } catch (err) {
      showToast(err.message || "Error al inactivar");
    }
  };

  // Manejar activación: cambiar de inactivo a activo
  const handleActivate = async (idx) => {
    const user = inactivos[idx];
    if (!user?.id) return;
    try {
      const payload = buildPayload(user, true);
      const res = await authFetch(`${API_BASE}/usuarios/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "No se pudo activar el usuario");
      }
      showToast("Usuario activado");
      fetchUsers();
    } catch (err) {
      showToast(err.message || "Error al activar");
    }
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h2>Usuarios</h2>
        <div className="users-actions">
          <button className="action primary" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            <span>Nuevo usuario</span>
          </button>
          <button
            className="action primary"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RotateCcw size={16} />
            <span>Refrescar</span>
          </button>
          <input
            className="search"
            placeholder="Buscar…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de usuarios activos */}
      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Área</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>
                <span className="th">
                  <Calendar size={14} className="th-icon" />
                  <span>Creación</span>
                </span>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="loading-row">
                  Cargando usuarios…
                </td>
              </tr>
            )}

            {!loading && activos.length === 0 && (
              <tr>
                <td colSpan={8} className="loading-row">
                  No hay usuarios activos.
                </td>
              </tr>
            )}

            {!loading &&
              activos.length > 0 &&
              activos.map((u, idx) => (
                <tr key={u.id || u.usuario || idx}>
                  <td>{u.nombre_completo}</td>
                  <td>{u.usuario}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="area-badge">
                      {getAreaNombre(u.area_id)}
                    </span>
                  </td>
                  <td>
                    <span className={roleClass(u.rol)}>
                      {u.rol || "Sin rol"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.estado === "activo" ? "badge-success" : "badge-muted"
                      }`}
                    >
                      {u.estado === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>{fmtDate(u.fecha_creacion)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        title="Editar"
                        onClick={() => {
                          setEditingUser(u);
                          setShowForm(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Eliminar"
                        onClick={() => handleDelete(idx, true)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Tabla de usuarios inactivos */}
      {inactivos.length > 0 && (
        <>
          <h3>Inactivos</h3>
          <div className="users-table-wrap inactive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Área</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>
                    <span className="th">
                      <Calendar size={14} className="th-icon" />
                      <span>Creación</span>
                    </span>
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inactivos.length === 0 && (
                  <tr>
                    <td colSpan={8} className="loading-row">
                      No hay usuarios inactivos.
                    </td>
                  </tr>
                )}

                {inactivos.length > 0 &&
                  inactivos.map((u, idx) => (
                    <tr key={u.id || `${u.usuario}-${idx}`}>
                      <td>{u.nombre_completo}</td>
                      <td>{u.usuario}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="area-badge">
                          {getAreaNombre(u.area_id)}
                        </span>
                      </td>
                      <td>
                        <span className={roleClass(u.rol)}>
                          {u.rol || "Sin rol"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.estado === "activo"
                              ? "badge-success"
                              : "badge-muted"
                          }`}
                        >
                          {u.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>{fmtDate(u.fecha_creacion)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn edit-btn"
                            title="Editar"
                            onClick={() => {
                              setEditingUser(u);
                              setShowForm(true);
                            }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="action-btn activate-btn"
                            title="Activar"
                            onClick={() => handleActivate(idx)}
                          >
                            <RotateCcw size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showForm && (
        <UserForm
          editData={editingUser}
          rolesOptions={roles}
          areasOptions={areas}
          onClose={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          onFinish={upsertUser}
        />
      )}

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={
          toastMessage?.toLowerCase().includes("error") ? "error" : "success"
        }
      />
    </div>
  );
}

export default Usuarios;
