import { Router } from "express";
import { isAdmin } from "../middlewares/verifySession.mjs";
import { checkSchema, validationResult } from "express-validator";
import { notificationInputSchema } from "../schemas/inputSchema/notificationSchema.mjs";
const router = Router();
router.post(
  "/",
  isAdmin,
  checkSchema(notificationInputSchema),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).send({ err: result.array().at(0).msg });
    const {
      body: { title, content, user, recieverType },
    } = req;
    const newNotification = {
      title,
      content,
      user,
      recieverType: recieverType || "all",
    };
    if (newNotification.recieverType == "single" && !newNotification.user)
      return res.status(400).send({
        err: "for single user notification user id must be specified",
      });
  },
);
export default router;
