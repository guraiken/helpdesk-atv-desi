import * as categoryService from "../services/category.service.js";

export async function list(req, res) {
    const categories = await categoryService.list();
    res.status(200).json(categories);
}
