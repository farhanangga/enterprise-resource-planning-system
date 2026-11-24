import { Router } from "express";

const router = Router();

const heroData = {
    id: 1,
    title:["Manage your", "company more", "easily"],
    description:"Unifying finance, HR, inventory, sales, and operations in one platform. Faster decisions, streamlined processes, and a more growth-ready business.",
}

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Users retrieved successfully",
    data: heroData
  });
});

export default router;