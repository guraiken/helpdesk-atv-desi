import * as categoryRepository from "../repositories/category.repository.js";
import { toCategory } from "../utils/mappers.js";

export async function list() {
    const rows = await categoryRepository.findAll();
    return rows.map(toCategory);
}
