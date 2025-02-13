import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });
import express, { Request, Response } from "express";
import cors from "cors";

import { SystemMessage } from "@langchain/core/messages";
import { LLMService } from "./llmService";

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());

const llmService = new LLMService({ temperature: 1 });

async function handleGeneratePoem(): Promise<string> {
  const prompt = "Generate a poem, no other text";
  const langchainMessages = [new SystemMessage(prompt)];
  const llmResponse = await llmService.invoke(langchainMessages);
  return llmResponse;
}

app.post("/generate-poem", async (req: Request, res: Response) => {
  console.log("Received POST request at /generate-poem");
  try {
    const poem = await handleGeneratePoem();
    res.status(200).json({ poem });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, "::", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
