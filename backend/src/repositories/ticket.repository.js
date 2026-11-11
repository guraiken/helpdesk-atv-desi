import db from "../config/db.js";
import { STATUS } from "../utils/constants.js";

const BASE_SELECT = `
    SELECT c.id_chamado, c.assunto, c.descricao, c.prioridade, c.status,
           c.data_abertura, c.solucao,
           c.id_categoria, cat.nome AS categoria_nome,
           c.id_solicitante, s.nome AS solicitante_nome,
           c.id_tecnico, t.nome AS tecnico_nome
    FROM chamados c
    INNER JOIN categorias cat ON cat.id_categoria = c.id_categoria
    INNER JOIN usuarios s ON s.id_usuario = c.id_solicitante
    LEFT JOIN usuarios t ON t.id_usuario = c.id_tecnico
`;

export async function findAll({ requesterId, search, sorted = true } = {}) {
    const conditions = [];
    const params = [];

    if (requesterId) {
        conditions.push("c.id_solicitante = ?");
        params.push(requesterId);
    }

    if (search) {
        const term = `%${search}%`;
        const number = search.replace(/^#/, "");
        if (/^\d+$/.test(number)) {
            conditions.push("(c.id_chamado = ? OR c.assunto LIKE ?)");
            params.push(Number(number), term);
        } else {
            conditions.push("c.assunto LIKE ?");
            params.push(term);
        }
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderBy = sorted ? "ORDER BY c.data_abertura DESC, c.id_chamado DESC" : "";
    const [rows] = await db.query(`${BASE_SELECT} ${where} ${orderBy}`, params);
    return rows;
}

export async function findById(id, connection = db) {
    const [rows] = await connection.query(`${BASE_SELECT} WHERE c.id_chamado = ?`, [id]);
    return rows[0] || null;
}

export async function lockById(id, connection) {
    const [rows] = await connection.query(
        "SELECT id_chamado FROM chamados WHERE id_chamado = ? FOR UPDATE",
        [id]
    );
    return rows.length > 0;
}

export async function countByStatus(requesterId) {
    const where = requesterId ? "WHERE id_solicitante = ?" : "";
    const params = requesterId ? [requesterId] : [];
    const [rows] = await db.query(
        `SELECT status, COUNT(*) AS total FROM chamados ${where} GROUP BY status`,
        params
    );
    return rows;
}

export async function create({ subject, description, categoryId, priority, requesterId, openedAt }) {
    const [result] = await db.query(
        `INSERT INTO chamados (assunto, descricao, id_categoria, prioridade, id_solicitante, data_abertura, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [subject, description, categoryId, priority, requesterId, openedAt, STATUS.OPEN]
    );
    return result.insertId;
}

export async function update(id, { subject, description, categoryId, priority }, connection = db) {
    const [result] = await connection.query(
        `UPDATE chamados SET assunto = ?, descricao = ?, id_categoria = ?, prioridade = ?
         WHERE id_chamado = ?`,
        [subject, description, categoryId, priority, id]
    );
    return result.affectedRows;
}

export async function remove(id, connection = db) {
    const [result] = await connection.query("DELETE FROM chamados WHERE id_chamado = ?", [id]);
    return result.affectedRows;
}

export async function take(id, technicianId, connection = db) {
    const [result] = await connection.query(
        `UPDATE chamados SET id_tecnico = ?, status = ?
         WHERE id_chamado = ? AND id_tecnico IS NULL AND status = ?`,
        [technicianId, STATUS.IN_PROGRESS, id, STATUS.OPEN]
    );
    return result.affectedRows;
}

export async function close(id, solution, connection = db) {
    const [result] = await connection.query(
        "UPDATE chamados SET status = ?, solucao = ? WHERE id_chamado = ?",
        [STATUS.CLOSED, solution, id]
    );
    return result.affectedRows;
}
