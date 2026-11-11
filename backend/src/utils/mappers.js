export function toUser(row) {
    return {
        id: row.id_usuario,
        name: row.nome,
        email: row.email,
        role: row.perfil,
    };
}

export function toCategory(row) {
    return {
        id: row.id_categoria,
        name: row.nome,
        description: row.descricao,
    };
}

export function toTicket(row) {
    return {
        id: row.id_chamado,
        subject: row.assunto,
        description: row.descricao,
        priority: row.prioridade,
        status: row.status,
        openedAt: row.data_abertura,
        solution: row.solucao,
        category: {
            id: row.id_categoria,
            name: row.categoria_nome,
        },
        requester: {
            id: row.id_solicitante,
            name: row.solicitante_nome,
        },
        technician: row.id_tecnico
            ? { id: row.id_tecnico, name: row.tecnico_nome }
            : null,
    };
}

export function toHistory(row) {
    return {
        id: row.id_historico,
        ticketId: row.id_chamado,
        technician: {
            id: row.id_tecnico,
            name: row.tecnico_nome,
        },
        attendedAt: row.data_atendimento,
        note: row.observacao,
        resultingStatus: row.status_resultante,
    };
}
