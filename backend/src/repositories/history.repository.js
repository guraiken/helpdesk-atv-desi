import db from "../config/db.js";

export async function findByTicket(ticketId, connection = db) {
    const [rows] = await connection.query(
        `SELECT h.id_historico, h.id_chamado, h.id_tecnico, u.nome AS tecnico_nome,
                h.data_atendimento, h.observacao, h.status_resultante
         FROM historico_atendimentos h
         INNER JOIN usuarios u ON u.id_usuario = h.id_tecnico
         WHERE h.id_chamado = ?
         ORDER BY h.data_atendimento ASC, h.id_historico ASC`,
        [ticketId]
    );
    return rows;
}

export async function countByTicket(ticketId, connection = db) {
    const [rows] = await connection.query(
        "SELECT COUNT(*) AS total FROM historico_atendimentos WHERE id_chamado = ?",
        [ticketId]
    );
    return Number(rows[0].total);
}

export async function create({ ticketId, technicianId, attendedAt, note, resultingStatus }, connection = db) {
    const [result] = await connection.query(
        `INSERT INTO historico_atendimentos (id_chamado, id_tecnico, data_atendimento, observacao, status_resultante)
         VALUES (?, ?, ?, ?, ?)`,
        [ticketId, technicianId, attendedAt, note, resultingStatus]
    );
    return result.insertId;
}
