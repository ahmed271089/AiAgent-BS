import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeProblem } from "./agent";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "AiAgent-BS" });
});

app.post("/analyze", async (req, res) => {
  try {
    const input = req.body;
    if (!input.postId || !input.title || !input.description || !input.categorySlug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await analyzeProblem(input);
    res.json(result);
  } catch (error) {
    console.error("Error in /analyze endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`AiAgent-BS is running on http://localhost:${PORT}`);
});
