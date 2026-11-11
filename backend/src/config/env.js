import "dotenv/config";

const env = {
    port: Number(process.env.PORT) || 3000,
    db: {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "helpdesk_db",
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    },
};

if (!env.jwt.secret) {
    throw new Error("The JWT_SECRET environment variable is not defined");
}

export default env;
