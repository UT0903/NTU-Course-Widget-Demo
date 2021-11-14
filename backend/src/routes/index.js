import { Router } from "express";
import login from "./login";
import course from "./course";

const router = Router();

router.use("/", login);
router.use("/courses", course);

export default router;
