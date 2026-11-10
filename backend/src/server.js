import app from "./app.js";
import { testConnection } from "./config/db.js";
import env from "./config/env.js";

try {
    await testConnection();
    console.log("Database connected successfully");
} catch (error) {
    console.error("Error connecting to the database:", error.message);
}

app.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
});
