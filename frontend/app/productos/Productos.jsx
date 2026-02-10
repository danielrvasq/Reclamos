"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus, RotateCcw } from "lucide-react";
import ProductForm from "./ProductForm";
import TypeManager from "./TypeManager";
import Toast from "../common/Toast";
import { authFetch } from "../utils/authFetch";
import "./Productos.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function Productos() {
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/productos`);
      const json = await res.json();
      if (res.ok) {
        setProducts(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTypes = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/tipos-producto`);
      const json = await res.json();
      if (res.ok) {
        setTypes(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching types:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchTypes();
  }, [fetchProducts, fetchTypes]);

  const money = useMemo(
    () =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }),
    []
  );

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-CO") : "—");

  const getTipoNombre = (tipoId) => {
    if (!tipoId) return "Sin tipo";
    const tipo = types.find((t) => t.id === tipoId);
    return tipo ? tipo.nombre : "Sin tipo";
  };

  const normalize = (value) => (value || "").toString().toLowerCase();
  const matchesSearch = (product) => {
    const term = normalize(searchTerm).trim();
    if (!term) return true;
    return [
      product.codigo,
      product.nombre,
      product.descripcion,
      getTipoNombre(product.tipo_producto_id),
    ].some((field) => normalize(field).includes(term));
  };

  const activos = products.filter((p) => p.activo && matchesSearch(p));
  const inactivos = products.filter((p) => !p.activo && matchesSearch(p));

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleDelete = async (idx, isActive) => {
    const product = isActive ? activos[idx] : inactivos[idx];
    if (!product?.id) return;

    try {
      const res = await authFetch(`${API_BASE}/productos/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: product.codigo,
          nombre: product.nombre,
          descripcion: product.descripcion,
          tipo_producto_id: product.tipo_producto_id,
          activo: false,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al inactivar producto");
      }

      showToast("Producto movido a inactivos");
      fetchProducts();
    } catch (err) {
      showToast(err.message || "Error al inactivar");
    }
  };

  const handleActivate = async (idx) => {
    const product = inactivos[idx];
    if (!product?.id) return;

    try {
      const res = await authFetch(`${API_BASE}/productos/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: product.codigo,
          nombre: product.nombre,
          descripcion: product.descripcion,
          tipo_producto_id: product.tipo_producto_id,
          activo: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al activar producto");
      }

      showToast("Producto activado");
      fetchProducts();
    } catch (err) {
      showToast(err.message || "Error al activar");
    }
  };

  const handleSaveProduct = async (product) => {
    try {
      const isEdit = Boolean(editingProduct);
      const url = isEdit
        ? `${API_BASE}/productos/${editingProduct.id}`
        : `${API_BASE}/productos`;
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        codigo: product.codigo || null,
        nombre: product.nombre,
        descripcion: product.descripcion || null,
        tipo_producto_id: product.tipo_producto_id || null,
        activo: true,
      };

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al guardar producto");
      }

      setShowForm(false);
      setEditingProduct(null);
      showToast(isEdit ? "Producto actualizado" : "Producto creado");
      fetchProducts();
    } catch (err) {
      showToast(err.message || "Error al guardar");
    }
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Productos</h2>
        <div className="products-actions">
          <button className="action primary" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            <span>Nuevo producto</span>
          </button>
          <button
            className="action primary"
            onClick={() => setShowTypeManager(true)}
          >
            <Plus size={16} />
            <span>Gestionar tipos</span>
          </button>
          <input
            className="search"
            placeholder="Buscar…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="products-table-wrap">
        <table className="products-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activos.map((product, idx) => {
              const tipo = getTipoNombre(product.tipo_producto_id);
              return (
                <tr key={product.id}>
                  <td>{product.codigo || "—"}</td>
                  <td>{product.nombre}</td>
                  <td>{product.descripcion || "—"}</td>
                  <td>
                    <span
                      className={`tag ${
                        tipo === "Cemento UG" ? "tag-cemento" : "tag-acabados"
                      }`}
                    >
                      {tipo}
                    </span>
                  </td>
                  <td className="table-cell-center">
                    {fmtDate(product.created_at)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        title="Editar"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Inactivar"
                        onClick={() => handleDelete(idx, true)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {inactivos.length > 0 && (
        <>
          <h3>Inactivos</h3>
          <div className="products-table-wrap inactive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th>Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inactivos.map((product, idx) => {
                  const tipo = getTipoNombre(product.tipo_producto_id);
                  return (
                    <tr key={product.id}>
                      <td>{product.codigo || "—"}</td>
                      <td>{product.nombre}</td>
                      <td>{product.descripcion || "—"}</td>
                      <td>
                        <span
                          className={`tag ${
                            tipo === "Cemento UG"
                              ? "tag-cemento"
                              : "tag-acabados"
                          }`}
                        >
                          {tipo}
                        </span>
                      </td>
                      <td className="table-cell-center">
                        {fmtDate(product.created_at)}
                      </td>
                      <td>
                        <div className="action-buttons">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showForm && (
        <ProductForm
          editData={editingProduct}
          types={types}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onFinish={handleSaveProduct}
        />
      )}

      {showTypeManager && (
        <TypeManager
          onClose={() => setShowTypeManager(false)}
          onRefresh={fetchTypes}
        />
      )}

      <Toast visible={toastVisible} message={toastMessage} type="success" />
    </div>
  );
}

export default Productos;
