import type { Context } from "../context";
import type { Handler } from "./types";

export const report: Handler = ({ adminBot }: Context) => async (req, res) => {
  const { message } = req.body;

  try {
    await adminBot.sendToAdminChannel(
      "Submission from feedback form:",
      message,
    );
  } catch (error) {
    console.error(error);
    res.status(500);
    res.json({ error: { message: "Failed to submit feedback" } });
  }

  res.json({ data: message });
};

export default {
  report,
};
