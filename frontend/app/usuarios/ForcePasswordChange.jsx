"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import "./ForcePasswordChange.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function ForcePasswordChange() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordPolicyError = (value) => {
    if (!value) return "";
    if (value.length < 10)
      return "La contraseña debe tener al menos 10 caracteres";
    if (!/[A-Z]/.test(value)) return "La contraseña debe incluir una mayúscula";
    if (!/\d/.test(value)) return "La contraseña debe incluir un número";
    if (!/[^A-Za-z0-9]/.test(value))
      return "La contraseña debe incluir un caracter especial";
    return "";
  };

  const checks = {
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const policyError = getPasswordPolicyError(password);
    if (policyError) {
      setError(policyError);
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    if (!usuario?.id) {
      setError("No se encontró el usuario en sesión");
      return;
    }

    try {
      setLoading(true);
      const res = await authFetch(
        `${API_BASE}/usuarios/${usuario.id}/password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Error al cambiar la contraseña");
        return;
      }

      const updatedUser = {
        ...usuario,
        force_password_change: false,
      };
      localStorage.setItem("usuario", JSON.stringify(updatedUser));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      setError("Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="force-password">
      <div className="force-password-card">
        <h2>Cambia tu contraseña</h2>
        <p>Debes actualizar tu contraseña para continuar.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Nueva contraseña
            <div className="fp-input">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Ver contraseña"
                }
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label>
            Confirmar contraseña
            <div className="fp-input">
              <input
                type={showPassword2 ? "text" : "password"}
                value={password2}
                onChange={(e) => {
                  setPassword2(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword2((v) => !v)}
                aria-label={
                  showPassword2 ? "Ocultar contraseña" : "Ver contraseña"
                }
              >
                {showPassword2 ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <div className="fp-policy">
            <span>Política de contraseña</span>
            <ul>
              <li className={checks.length ? "ok" : ""}>
                Al menos 10 caracteres
              </li>
              <li className={checks.uppercase ? "ok" : ""}>Una mayúscula</li>
              <li className={checks.number ? "ok" : ""}>Un número</li>
              <li className={checks.special ? "ok" : ""}>
                Un caracter especial
              </li>
            </ul>
          </div>

          {error && <div className="fp-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForcePasswordChange;
