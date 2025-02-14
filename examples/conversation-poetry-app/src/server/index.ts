import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../../../shared/server/.env" });
import express, { Request, Response } from "express";
import cors from "cors";
import {
  sendMessageHandler,
  generatePoemHandler,
  resetConversationHandler,
} from "./handlers";

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

app.post("/send-message", async (req: Request, res: Response) => {
  const userMessage: string = req.body.message;
  if (!userMessage) {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  try {
    const response = await sendMessageHandler(userMessage);
    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/generate-poem", async (req: Request, res: Response) => {
  try {
    const poem = await generatePoemHandler();
    res.status(200).json({ poem });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/reset-conversation", (req: Request, res: Response) => {
  const message = resetConversationHandler();
  res.status(200).json({ message });
});

app.listen(port, "::", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
