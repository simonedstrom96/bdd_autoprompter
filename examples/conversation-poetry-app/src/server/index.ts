import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../../../shared/server/.env" });
import express, { Request, Response } from "express";
import cors from "cors";
import {
  sendMessageHandler,
  generatePoemHandler,
  resetConversationHandler,
  deleteConversationHandler,
} from "./handlers";

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

app.post("/send-message", async (req: Request, res: Response) => {
  const conversationId: string = req.body.conversationId;
  const userMessage: string = req.body.message;
  if (!conversationId) {
    res.status(400).json({ error: "Conversation ID is required." });
    return;
  }
  if (!userMessage) {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  try {
    const response = await sendMessageHandler(conversationId, userMessage);
    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/generate-poem", async (req: Request, res: Response) => {
  const conversationId: string = req.body.conversationId;
  if (!conversationId) {
    res.status(400).json({ error: "Conversation ID is required." });
    return;
  }

  try {
    const poem = await generatePoemHandler(conversationId);
    res.status(200).json({ poem });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/reset-conversation", (req: Request, res: Response) => {
  const conversationId: string = req.body.conversationId;
  if (!conversationId) {
    res.status(400).json({ error: "Conversation ID is required." });
    return;
  }
  const message = resetConversationHandler(conversationId);
  res.status(200).json({ message });
});

app.delete("/delete-conversation", async (req: Request, res: Response) => {
  const conversationId: string = req.body.conversationId;
  if (!conversationId) {
    res.status(400).json({ error: "Conversation ID is required." });
    return;
  }

  try {
    await deleteConversationHandler(conversationId);
    res.status(200).json({ message: "Conversation deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, "::", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
