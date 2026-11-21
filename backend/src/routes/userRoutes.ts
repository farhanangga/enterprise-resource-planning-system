
import { Router } from "express";

const router = Router();

const users = [
  {
    id: 1,
    name: "Farhan Angga",
    email: "farhan@gmail.com",
    role: "Admin"
  },
  {
    id: 2,
    name: "Budi Santoso",
    email: "budi@gmail.com",
    role: "Employee"
  },
  {
    id: 3,
    name: "Andi Wijaya",
    email: "andi@gmail.com",
    role: "Manager"
  }
];

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Users retrieved successfully",
    data: users
  });
});

export default router;
