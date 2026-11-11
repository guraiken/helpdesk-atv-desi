import AppError from "../utils/AppError.js";

export default function validate(schemas) {
    return (req, res, next) => {
        const validated = {};
        const errors = [];

        for (const source of ["params", "query", "body"]) {
            const schema = schemas[source];
            if (!schema) {
                continue;
            }

            const result = schema.safeParse(req[source] ?? {});
            if (result.success) {
                validated[source] = result.data;
            } else {
                for (const issue of result.error.issues) {
                    errors.push({
                        field: issue.path.join(".") || source,
                        message: issue.message,
                    });
                }
            }
        }

        if (errors.length > 0) {
            throw new AppError(errors[0].message, 400, errors);
        }

        req.validated = validated;
        next();
    };
}
