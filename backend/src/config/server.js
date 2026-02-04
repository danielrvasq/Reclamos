import sql from "mssql";
import dotenv from "dotenv";

// Cargar variables de entorno desde .env
dotenv.config();

const config = {
  server: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASS || '',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      console.log("Conectado a la base de datos SQL Server");
      return pool;
    })
    .catch((err) => {
      console.error("Error al conectar a la base de datos SQL Server", err);
      throw err;
    });
export { sql, poolPromise };