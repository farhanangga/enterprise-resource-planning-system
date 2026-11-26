
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import heroRoutes from "./routes/heroRoutes";
import aboutRoutes from "./routes/aboutRoutes";
import stepsRoutes from "./routes/stepsRoutes";
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
app.use("/api/hero", heroRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/steps", stepsRoutes);

export default app;
