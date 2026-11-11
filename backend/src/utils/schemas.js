import { z } from "zod";
import { PRIORITIES } from "./constants.js";

function requiredText(message, maxLength) {
    let schema = z.string({ error: message }).trim().min(1, { error: message });
    if (maxLength) {
        schema = schema.max(maxLength, {
            error: `Informe no máximo ${maxLength} caracteres`,
        });
    }
    return schema;
}

const attendedAt = z
    .string({ error: "Data e hora do atendimento inválida" })
    .trim()
    .refine((value) => value !== "" && !Number.isNaN(Date.parse(value)), {
        error: "Data e hora do atendimento inválida",
    })
    .transform((value) => new Date(value))
    .nullish();

export const idParamSchema = z.object({
    id: z.coerce
        .number({ error: "Número do chamado inválido" })
        .int({ error: "Número do chamado inválido" })
        .positive({ error: "Número do chamado inválido" }),
});

export const loginSchema = z.object({
    email: requiredText("O e-mail é obrigatório").pipe(
        z.email({ error: "Informe um e-mail válido" })
    ),
    password: z
        .string({ error: "A senha é obrigatória" })
        .min(1, { error: "A senha é obrigatória" }),
});

export const ticketSchema = z.object({
    subject: requiredText("O assunto é obrigatório", 150),
    description: requiredText("A descrição é obrigatória", 5000),
    categoryId: z.coerce
        .number({ error: "A categoria é obrigatória" })
        .int({ error: "Categoria inválida" })
        .positive({ error: "A categoria é obrigatória" }),
    priority: z.enum(PRIORITIES, {
        error: "A prioridade deve ser Baixa, Média ou Alta",
    }),
});

export const listTicketsSchema = z.object({
    search: z.string().trim().max(150).optional(),
});

export const takeTicketSchema = z.object({
    attendedAt,
    note: z.string().trim().max(5000).nullish(),
});

export const noteSchema = z.object({
    attendedAt,
    note: requiredText("A observação do atendimento é obrigatória", 5000),
});

export const closeTicketSchema = z.object({
    attendedAt,
    solution: requiredText(
        "Informe a descrição da solução para finalizar o chamado",
        5000
    ),
});
