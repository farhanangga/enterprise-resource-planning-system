import {Router} from "express";

const router = Router();

export type StepsItem = {
    title : string;
    text : string;
}

export const stepsData: StepsItem[] = [
  { title: "Create your account", text: "Sign up with your email and name your company." },
  { title: "Set up your business", text: "Add products and customers, then invite your team." },
  { title: "Run it from one dashboard", text: "Record transactions and watch your numbers update live." },
];

router.get("/", (req,res) => {
    res.json({
        success: true,
        message: "Steps retrived succcessfully",
        data: stepsData,
    })
});

export default router;