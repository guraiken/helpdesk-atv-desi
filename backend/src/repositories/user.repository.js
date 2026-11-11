import db from "../config/db.js";

export async function findByEmail(email) {
    const [rows] = await db.query(
        "SELECT id_usuario, nome, email, senha_hash, perfil FROM usuarios WHERE email = ?",
        [email]
    );
    return rows[0] || null;
}

export async function create({ name, email, passwordHash, role }) {
    const [result] = await db.query(
        "INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)",
        [name, email, passwordHash, role]
    );
    return result.insertId;
}

export async function findById(id) {
    const [rows] = await db.query(
        "SELECT id_usuario, nome, email, perfil FROM usuarios WHERE id_usuario = ?",
        [id]
    );
    return rows[0] || null;
}
