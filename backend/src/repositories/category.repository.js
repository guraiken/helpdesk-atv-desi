import db from "../config/db.js";

export async function findAll() {
    const [rows] = await db.query(
        "SELECT id_categoria, nome, descricao FROM categorias ORDER BY nome"
    );
    return rows;
}

export async function findById(id) {
    const [rows] = await db.query(
        "SELECT id_categoria, nome, descricao FROM categorias WHERE id_categoria = ?",
        [id]
    );
    return rows[0] || null;
}
