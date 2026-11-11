import * as ticketService from "../services/ticket.service.js";

export async function list(req, res) {
    const tickets = await ticketService.list(req.user, req.validated.query.search);
    res.status(200).json(tickets);
}

export async function getById(req, res) {
    const ticket = await ticketService.getById(req.user, req.validated.params.id);
    res.status(200).json(ticket);
}

export async function create(req, res) {
    const ticket = await ticketService.create(req.user, req.validated.body);
    res.status(201).json(ticket);
}

export async function update(req, res) {
    const ticket = await ticketService.update(
        req.user,
        req.validated.params.id,
        req.validated.body
    );
    res.status(200).json(ticket);
}

export async function remove(req, res) {
    await ticketService.remove(req.user, req.validated.params.id);
    res.status(204).send();
}
