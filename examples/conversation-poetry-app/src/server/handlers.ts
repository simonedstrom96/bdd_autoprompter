import {
  BaseMessage,
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { LLMService } from "../../../shared/server/llmService";
import { bddapGetPrompt } from "bdd-autoprompter";

const conversations: Record<string, BaseMessage[]> = {};
const llmService = new LLMService({ temperature: 1 });

export async function sendMessageHandler(
  conversationId: string,
  userMessageContent: string
): Promise<string> {
  if (!conversations[conversationId]) {
    conversations[conversationId] = [];
  }
  const conversation = conversations[conversationId];

  const userMessage = new HumanMessage(userMessageContent);
  conversation.push(userMessage);

  const systemMessageContent = bddapGetPrompt({
    content:
      "You are a helpful assistant that guides users to create nice and happy poems.",
    name: "Poem generation conversation system prompt",
    description:
      "The intent of the conversation is that the AI will guide the user to creating poems about nice and happy subjects.",
  });
  const systemMessage = new SystemMessage(systemMessageContent);
  const messagesForLLM = [systemMessage, ...conversation];

  const assistantResponseContent = await llmService.invoke(messagesForLLM);
  const assistantResponse = new AIMessage(assistantResponseContent);
  conversation.push(assistantResponse);
  return assistantResponseContent;
}

export async function generatePoemHandler(
  conversationId: string
): Promise<string> {
  if (!conversations[conversationId]) {
    conversations[conversationId] = [];
  }
  const conversation = conversations[conversationId];

  const poemGenerationInstructionContent = bddapGetPrompt({
    content:
      "Generate a poem based on the following conversation, no other text",
    name: "Poem generation instruction prompt",
    description:
      "This prompt should take the users conversation and transform it into one coherent poem that is nice and happy",
  });
  const systemMessage = new SystemMessage(poemGenerationInstructionContent);
  const messagesForLLM = [systemMessage, ...conversation];

  const poem = await llmService.invoke(messagesForLLM);
  return poem;
}

export function resetConversationHandler(conversationId: string): string {
  conversations[conversationId] = [];
  return "Conversation reset.";
}

export async function deleteConversationHandler(
  conversationId: string
): Promise<void> {
  if (conversations[conversationId]) {
    delete conversations[conversationId];
  } else {
    throw new Error("Conversation not found.");
  }
}
