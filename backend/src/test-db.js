

import { sql, poolPromise } from "./config/server.js";

async function testConnection() {
  try {
    console.log("🔍 Probando conexión a SQL Server...");
    const pool = await poolPromise;

    // Test 1: Consulta simple
    const result = await pool.request().query("SELECT 1 as test");
    console.log("✅ Conexión exitosa!");
    console.log("📊 Resultado:", result.recordset);

    // Test 2: Ver bases de datos disponibles
    const dbResult = await pool
      .request()
      .query("SELECT name FROM sys.databases");
    console.log("\n📁 Bases de datos disponibles:");
    dbResult.recordset.forEach((db) => {
      console.log(`   - ${db.name}`);
    });

    // Test 3: Ver tablas en la base de datos actual
    const tablesResult = await pool
      .request()
      .query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`
      );
    console.log(`\n📋 Tablas en "${process.env.DB_NAME}":`);
    if (tablesResult.recordset.length > 0) {
      tablesResult.recordset.forEach((table) => {
        console.log(`   - ${table.TABLE_NAME}`);
      });
    } else {
      console.log("   (No hay tablas aún)");
    }

    console.log("\n✨ Todas las pruebas pasaron correctamente");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

testConnection();
