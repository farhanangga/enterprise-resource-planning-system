
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import apiKeyMiddleware from "./middlewares/apiKeyMiddleware";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "Enterprise Management API is running!"
  });
});

// Export app
app.use("/api",apiKeyMiddleware);
app.use("/api/users", userRoutes);
export default app;
