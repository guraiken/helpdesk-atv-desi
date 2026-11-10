import mysql2 from "mysql2/promise";
import env from "./env.js";

const db = mysql2.createPool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    charset: "utf8mb4",
    timezone: "local",
    waitForConnections: true,
    connectionLimit: 10,
});

export async function withTransaction(callback) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function testConnection() {
    const connection = await db.getConnection();
    connection.release();
}

export default db;
