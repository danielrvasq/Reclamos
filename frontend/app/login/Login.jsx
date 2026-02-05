"use client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al iniciar sesión");
        return;
      }

      // Guardar token y datos del usuario
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        if (data.usuario?.force_password_change) {
          navigate("/cambiar-contrasena");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("No se recibió token de autenticación");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Error de conexión. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al iniciar sesión con Google");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        if (data.usuario?.force_password_change) {
          navigate("/cambiar-contrasena");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("No se recibió token de autenticación");
      }
    } catch (error) {
      console.error("Error en Google Login:", error);
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Error al conectar con Google");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/Plomada-03.ico" alt="RadicApp" className="login-logo" />
        <h1>Reclamos</h1>
        <p className="subtitle">Sistema de Reclamos</p>

        {error && (
          <div
            className="error-message"
            style={{
              padding: "10px",
              marginBottom: "15px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              placeholder="usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div
          className="google-login-container"
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            className="separator"
            style={{
              margin: "15px 0",
              width: "100%",
              textAlign: "center",
              borderBottom: "1px solid #ddd",
              lineHeight: "0.1em",
            }}
          >
            <span
              style={{ background: "#fff", padding: "0 10px", color: "#777" }}
            >
              O
            </span>
          </div>
          {GOOGLE_CLIENT_ID ? (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="100%"
              />
            </GoogleOAuthProvider>
          ) : (
            <p style={{ color: "red", fontSize: "12px" }}>
              Google Client ID no configurado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
