"use client";
import { useState } from "react";
import { X, UserPlus, ChevronDown, Eye, EyeOff } from "lucide-react";
import "./UserForm.css";

function UserForm({
  onClose,
  onFinish,
  editData = null,
  rolesOptions = [],
  areasOptions = [],
}) {
  const [form, setForm] = useState({
    nombre_completo: editData?.nombre_completo || "",
    usuario: editData?.usuario || "",
    email: editData?.email || "",
    password: "",
    rol_id: editData?.rol_id || (rolesOptions[0]?.id ?? ""),
    area_id: editData?.area_id || (areasOptions[0]?.id ?? ""),
  });
  const [password2, setPassword2] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const getPasswordPolicyError = (password) => {
    if (!password) return "";
    if (password.length < 10)
      return "La contraseña debe tener al menos 10 caracteres";
    if (!/[A-Z]/.test(password))
      return "La contraseña debe incluir una mayúscula";
    if (!/\d/.test(password)) return "La contraseña debe incluir un número";
    if (!/[^A-Za-z0-9]/.test(password))
      return "La contraseña debe incluir un caracter especial";
    return "";
  };

  const passwordChecks = {
    length: form.password.length >= 10,
    uppercase: /[A-Z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Solo validar contraseñas si se está ingresando una nueva (creación o cambio)
    if (form.password) {
      const policyError = getPasswordPolicyError(form.password);
      if (policyError) {
        setPasswordError(policyError);
        return;
      }
      if (form.password !== password2) {
        setPasswordError("Las contraseñas no coinciden");
        return;
      }
    }

    const now = new Date().toISOString();
    const { password, ...rest } = form;

    const payload = {
      ...rest,
      rol_id: form.rol_id,
      area_id: form.area_id,
      ...(form.password ? { password: form.password } : {}),
    };

    if (editData) {
      // Modo edición: mantener los datos originales
      onFinish?.({
        ...editData,
        ...payload,
      });
    } else {
      // Modo creación: nuevo usuario
      onFinish?.({
        ...payload,
        estado: "activo",
        fecha_creacion: now,
        ultimo_acceso: null,
      });
    }
  };

  return (
    <div className="uf-overlay" role="dialog" aria-modal="true">
      <div className="uf-modal" data-uf>
        <div className="uf-header">
          <div className="uf-title">
            <UserPlus size={18} />
            <span>{editData ? "Editar usuario" : "Nuevo usuario"}</span>
          </div>
          <button className="uf-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form className="uf-body" onSubmit={handleSubmit}>
          <div className="uf-grid">
            <label className="uf-field">
              <span>Nombre completo</span>
              <input
                type="text"
                value={form.nombre_completo}
                onChange={update("nombre_completo")}
                placeholder="Ej: Ana María Ríos"
                required
              />
            </label>

            <label className="uf-field">
              <span>Usuario</span>
              <input
                type="text"
                value={form.usuario}
                onChange={update("usuario")}
                placeholder="Ej: amrios"
                required
              />
            </label>

            <label className={`uf-field ${passwordError ? "invalid" : ""}`}>
              <span>
                Contraseña{editData ? " (dejar vacío para no cambiar)" : ""}
              </span>
              <div className="uf-password">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    update("password")(e);
                    const policyError = getPasswordPolicyError(e.target.value);
                    if (policyError) {
                      setPasswordError(policyError);
                      return;
                    }
                    if (password2 && e.target.value !== password2) {
                      setPasswordError("Las contraseñas no coinciden");
                      return;
                    }
                    setPasswordError("");
                  }}
                  placeholder="••••••••"
                  required={!editData}
                />
                <button
                  type="button"
                  className="uf-eye"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Ver contraseña"
                  }
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <label className={`uf-field ${passwordError ? "invalid" : ""}`}>
              <span>Confirmar contraseña</span>
              <div className="uf-password">
                <input
                  type={showPassword2 ? "text" : "password"}
                  value={password2}
                  onChange={(e) => {
                    setPassword2(e.target.value);
                    const policyError = getPasswordPolicyError(form.password);
                    if (policyError) {
                      setPasswordError(policyError);
                      return;
                    }
                    if (
                      form.password &&
                      e.target.value &&
                      form.password !== e.target.value
                    ) {
                      setPasswordError("Las contraseñas no coinciden");
                      return;
                    }
                    setPasswordError("");
                  }}
                  placeholder="••••••••"
                  required={!editData && !!form.password}
                />
                <button
                  type="button"
                  className="uf-eye"
                  onClick={() => setShowPassword2((prev) => !prev)}
                  aria-label={
                    showPassword2 ? "Ocultar contraseña" : "Ver contraseña"
                  }
                >
                  {showPassword2 ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <small className="uf-error">{passwordError}</small>
              )}
            </label>

            {form.password && (
              <div className="uf-policy">
                <span>Política de contraseña</span>
                <ul>
                  <li className={passwordChecks.length ? "ok" : ""}>
                    Al menos 10 caracteres
                  </li>
                  <li className={passwordChecks.uppercase ? "ok" : ""}>
                    Una mayúscula
                  </li>
                  <li className={passwordChecks.number ? "ok" : ""}>
                    Un número
                  </li>
                  <li className={passwordChecks.special ? "ok" : ""}>
                    Un caracter especial
                  </li>
                </ul>
              </div>
            )}

            <label className="uf-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="correo@ejemplo.com"
                required
              />
            </label>
            
            <label className="uf-field">
              <span>Rol</span>
              <div className="select-wrap">
                <select
                  value={form.rol_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rol_id: Number(e.target.value) }))
                  }
                  aria-label="Seleccionar rol"
                  required
                >
                  {rolesOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="chevron" />
              </div>
            </label>

            <label className="uf-field">
              <span>Área</span>
              <div className="select-wrap">
                <select
                  value={form.area_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, area_id: Number(e.target.value) }))
                  }
                  aria-label="Seleccionar área"
                  required
                >
                  {areasOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="chevron" />
              </div>
            </label>
          </div>

          <div className="uf-footer">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
