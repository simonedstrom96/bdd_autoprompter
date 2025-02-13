import { AzureChatOpenAI } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage } from "@langchain/core/messages";

interface llmConfig {
  temperature: number;
}

export class LLMService {
  private model: AzureChatOpenAI | ChatOpenAI;
  constructor(props: llmConfig) {
    if (process.env["AZURE_OPENAI_API_KEY"]) {
      this.model = this.makeAzureOpenAiChatModel(props);
    } else {
      this.model = this.makeOpenAiChatModel(props);
    }
  }

  public async invoke(messages: BaseMessage[]): Promise<string> {
    const llmResponse = await this.model.invoke(messages);
    const stringResponse = llmResponse.content.toString();
    return stringResponse;
  }

  private makeOpenAiChatModel(config: llmConfig): ChatOpenAI {
    if (!process.env["OPENAI_MODEL_NAME"]) {
      throw new Error("OPENAI_MODEL_NAME must be defined");
    }
    if (!process.env["OPENAI_API_KEY"]) {
      throw new Error("OPENAI_API_KEY must be defined");
    }
    return new ChatOpenAI({
      modelName: process.env["OPENAI_MODEL_NAME"],
      openAIApiKey: process.env["OPENAI_API_KEY"],
      ...config,
    });
  }

  private makeAzureOpenAiChatModel(config: llmConfig): AzureChatOpenAI {
    if (!process.env["AZURE_OPENAI_MODEL_NAME"]) {
      throw new Error("AZURE_OPENAI_MODEL_NAME must be defined");
    }
    if (!process.env["AZURE_OPENAI_API_KEY"]) {
      throw new Error("AZURE_OPENAI_API_KEY must be defined");
    }
    if (!process.env["AZURE_OPENAI_DEPLOYMENT_NAME"]) {
      throw new Error("AZURE_OPENAI_DEPLOYMENT_NAME must be defined");
    }
    if (!process.env["AZURE_OPENAI_INSTANCE_NAME"]) {
      throw new Error("AZURE_OPENAI_INSTANCE_NAME must be defined");
    }
    return new AzureChatOpenAI({
      modelName: process.env["AZURE_OPENAI_MODEL_NAME"],
      model: process.env["AZURE_OPENAI_MODEL_NAME"], // required for langfuse
      azureOpenAIApiKey: process.env["AZURE_OPENAI_API_KEY"],
      openAIApiKey: process.env["AZURE_OPENAI_API_KEY"], // required because langchain messy
      azureOpenAIApiVersion:
        process.env["AZURE_OPENAI_API_VERSION"] ?? "2023-05-15",
      azureOpenAIApiDeploymentName: process.env["AZURE_OPENAI_DEPLOYMENT_NAME"],
      azureOpenAIApiInstanceName: process.env["AZURE_OPENAI_INSTANCE_NAME"], //
      ...config,
    });
  }
}
