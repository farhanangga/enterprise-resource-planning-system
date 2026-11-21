import { Request, Response, NextFunction } from "express";

const apiKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"];
  const secretKey = process.env.API_SECRET_KEY;

  if (!secretKey) {
    console.error("API_SECRET_KEY is not configured!");

    return res.status(500).json({
      success: false,
      message: "API security configuration error",
    });
  }

  if (typeof apiKey !== "string" || apiKey !== secretKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid API Key",
    });
  }

  next();
};

export default apiKeyMiddleware;