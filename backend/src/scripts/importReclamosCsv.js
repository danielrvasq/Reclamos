import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import FormulariosModel from "../models/formulariosModel.js";
import { poolPromise } from "../config/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.resolve(__dirname, "../../reclamos - Hoja 1.csv");

const parseDate = (value) => {
  if (!value) return null;
  const normalized = value
    .toString()
    .trim()
    .replace(/\./g, "/")
    .replace(/-/g, "/");
  const parts = normalized.split("/").map((p) => p.trim());
  if (parts.length < 3) return null;
  const [day, month, yearRaw] = parts;
  const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
  const monthPadded = month.padStart(2, "0");
  const dayPadded = day.padStart(2, "0");
  const date = new Date(`${year}-${monthPadded}-${dayPadded}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseBoolFlag = (value) => {
  if (value === undefined || value === null) return null;
  const v = value.toString().trim().toUpperCase();
  if (!v) return null;
  if (["1", "SI", "SÍ", "TRUE", "X"].includes(v)) return true;
  if (["0", "NO", "FALSE"].includes(v)) return false;
  return null;
};

const parseCumplimiento = (value) => {
  const v = (value || "").toString().trim().toUpperCase();
  if (!v) return null;
  if (["CUMPLE", "A TIEMPO", "ANTICIPADO"].includes(v)) return true;
  if (["NO CUMPLE", "VENCIDO"].includes(v)) return false;
  return null;
};

const deriveFlagsFromCalificacion = (calificacion, currentFlags) => {
  const v = (calificacion || "").toString().trim().toUpperCase();
  if (v.includes("JUSTIFICADO")) {
    return { justificado: true, incertidumbre: false, no_justificado: false };
  }
  if (v.includes("INCERT")) {
    return { justificado: false, incertidumbre: true, no_justificado: false };
  }
  if (v.includes("NO JUSTIFIC")) {
    return { justificado: false, incertidumbre: false, no_justificado: true };
  }
  return currentFlags;
};

const mapProceso = (value, areaMap, unmappedAreas) => {
  const v = (value || "").toString().trim();
  if (!v) return null;
  const key = v.toUpperCase();
  const mapped = areaMap.get(key) ?? null;
  if (mapped === null) unmappedAreas.add(v);
  return mapped;
};

const mapRowToPayload = (row, areaMap, unmappedAreas) => {
  const get = (idx) => (row[idx] ?? "").toString().trim();
  const baseFlags = {
    justificado: parseBoolFlag(get(25)),
    incertidumbre: parseBoolFlag(get(26)),
    no_justificado: parseBoolFlag(get(27)),
  };
  const flags = deriveFlagsFromCalificacion(get(24), baseFlags);

  return {
    producto_id: parseInt(get(0), 10) || null,
    estado_id: parseInt(get(1), 10) || 1,
    asesor: get(2) || null,
    fecha_creacion: parseDate(get(3)) || new Date(),
    tiempo_respuesta: parseInt(get(4), 10) || null,
    fecha_limite_teorico: parseDate(get(5)),
    diferencia: parseInt(get(6), 10) || null,
    cumplimiento: parseCumplimiento(get(7)),
    proceso_responsable: mapProceso(get(8), areaMap, unmappedAreas),
    persona_responsable: (() => {
      const raw = get(9);
      const parsed = parseInt(raw, 10);
      return Number.isFinite(parsed) ? parsed : null;
    })(),
    cliente: get(10) || null,
    departamento: get(11) || null,
    ciudad: get(12) || null,
    nombre_contacto: get(13) || null,
    cargo: get(14) || null,
    telefono: get(15) || null,
    celular: get(16) || null,
    correo_electronico: get(17) || null,
    producto: get(18) || null,
    no_pedido: get(19) || null,
    no_remision: get(20) || null,
    fecha_despacho: parseDate(get(21)),
    via_ingreso: get(22) || null,
    descripcion_caso: get(23) || null,
    calificacion: get(24) || null,
    justificado: flags.justificado,
    incertidumbre: flags.incertidumbre,
    no_justificado: flags.no_justificado,
    clasificacion_id: parseInt(get(28), 10) || null,
    clase_id: parseInt(get(29), 10) || null,
    causa_id: parseInt(get(30), 10) || null,
    observaciones_primer_contacto: get(31) || null,
    avance_proceso_responsable: get(32) || null,
    ccpa: get(33) || null,
    solucion_final: get(34) || null,
    dias_habiles_demora: parseInt(get(35), 10) || null,
    fecha_cierre_definitiva: parseDate(get(36)),
    observaciones: get(37) || null,
    creado_por: null,
    created_at: new Date(),
  };
};

const readCsv = () => {
  const csvContent = fs.readFileSync(CSV_PATH, "utf8");
  return parse(csvContent, {
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
  });
};

const loadAreas = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query("SELECT id, nombre FROM area");
  const map = new Map();
  result.recordset.forEach(({ id, nombre }) => {
    if (nombre) {
      map.set(nombre.toUpperCase().trim(), id);
    }
  });
  return map;
};

const main = async () => {
  const records = readCsv();

  const areaMap = await loadAreas();
  const unmappedAreas = new Set();

  let inserted = 0;
  const failed = [];

  for (let i = 0; i < records.length; i += 1) {
    const row = records[i];
    if (!row || row.length === 0) continue;

    const payload = mapRowToPayload(row, areaMap, unmappedAreas);

    try {
      await FormulariosModel.create(payload);
      inserted += 1;
    } catch (err) {
      failed.push({ fila: i + 1, error: err.message });
      console.error(`Error en fila ${i + 1}: ${err.message}`);
    }
  }

  if (unmappedAreas.size > 0) {
    console.warn("Áreas sin mapear (deben existir en tabla area):", [
      ...unmappedAreas,
    ]);
  }

  if (failed.length > 0) {
    console.warn("Filas con error (primeras 10):", failed.slice(0, 10));
  }

  const pool = await poolPromise;
  await pool.close();
};

const isMainModule = (() => {
  // En Windows process.argv usa backslashes; normalizamos para comparar con __filename
  const argvPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
  return argvPath === path.resolve(__filename);
})();

if (isMainModule) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error general en importación:", err);
      process.exit(1);
    });
}
