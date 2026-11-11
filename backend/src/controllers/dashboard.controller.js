import * as ticketService from "../services/ticket.service.js";

export async function summary(req, res) {
    const tickets = await ticketService.summary(req.user);
    res.status(200).json({
        user: {
            name: req.user.name,
            role: req.user.role,
        },
        tickets,
    });
}
