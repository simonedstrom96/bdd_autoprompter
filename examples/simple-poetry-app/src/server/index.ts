import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../../../shared/server/.env" });
import express, { Request, Response } from "express";
import cors from "cors";
import { SystemMessage } from "@langchain/core/messages";
import { LLMService } from "../../../shared/server/llmService";
import { bddapGetPrompt } from "bdd-autoprompter";

const app = express();
const port = 8080;
app.use(express.json());
app.use(cors());

const llmService = new LLMService({ temperature: 1 });

export async function handleGeneratePoem(): Promise<string> {
  const initialPromptContent = "Generate a poem, no other text";
  const bddapPromptFields = {
    content: initialPromptContent,
    name: "Poem instruction prompt",
    description: "The prompt that instructs the LLM how to form the poem",
  };
  const promptContent = bddapGetPrompt(bddapPromptFields);
  const langchainMessages = [new SystemMessage(promptContent)];
  const llmResponse = await llmService.invoke(langchainMessages);
  return llmResponse;
}

app.post("/generate-poem", async (req: Request, res: Response) => {
  console.log("Received POST request at /generate-poem");
  try {
    const poem = await handleGeneratePoem();
    res.status(200).json({ poem });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.log(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

app.listen(port, "::", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
