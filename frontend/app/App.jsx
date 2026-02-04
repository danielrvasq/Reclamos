"use client";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/Login";
import Dashboard from "./dashboard/Dashboard";
import Reclamos from "./reclamos/Reclamos";
import Reportes from "./reportes/Reportes";
import Productos from "./productos/Productos";
import Matrices from "./matrices/Matrices";
import Auditoria from "./auditoria/Auditoria";
import Layout from "./layout/Layout";
import Usuarios from "./usuarios/Usuarios";
import Config from "./config/Config";
import ProtectedRoute from "./common/ProtectedRoute";
import "./App.css";

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <Layout>
                <Usuarios />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reclamos"
          element={
            <ProtectedRoute>
              <Layout>
                <Reclamos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <Layout>
                <Reportes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Layout>
                <Productos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/matrices"
          element={
            <ProtectedRoute>
              <Layout>
                <Matrices />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditoria"
          element={
            <ProtectedRoute>
              <Layout>
                <Auditoria />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/config"
          element={
            <ProtectedRoute>
              <Layout>
                <Config />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
