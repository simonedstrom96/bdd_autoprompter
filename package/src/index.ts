import {
  parseBddSpecs,
  BDDScenario,
  BDDSpecification,
  BDDFeature,
} from "./parseBddSpecs";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";
import { LLMService } from "./llmService";

export interface Persona {
  positive: boolean; // if the persona is a positive or a negative persona. A positive persona uses the system as intended and belongs to some group. A negative persona is attempting to misuse the system as its primary purpose.
  description: string;
}

export interface LLMConversation {
  name: string;
  description: string; // The conversation description should detail what the purpose of the conversation is
  likelyPersonas: Persona[];
  sendMessage: (
    conversationId: string,
    userInputContent: string
  ) => Promise<string>; // should return an ai response upon receiving a userInput for a given conversationId
}

export interface LLMConversationResult {
  conversationId: string;
  bddFeature: BDDFeature;
  result: BaseMessage[];
  promptsEncountered: PromptParams[];
}

export interface LLMArtifact {
  name: string;
  description: string;
  getArtifact: (input: any) => Promise<string>;
  variability?: number; // number 0-1 how variable the artifact generation is, corresponds to temperature for a single llm call. Defaults to 0, ie deterministic generation
}

export interface LLMArtifactResult {
  artifactId: string;
  bddFeature: BDDFeature;
  result: string;
  promptsEncountered: PromptParams[];
}

export interface LangfuseConfig {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
  additionalLangfuseConfig?: Object;
}

export interface AdditionalBddAutoPrompterConfig {
  conversationsPerPersona?: number;
  maxArtifactsAfterDimensionalityReduction?: number;
  artifactVariabilityGeneration?: number; // for a variability of 1, how many artifacts should be generated? Ie if an artifact has variability 0.5 and this number is set to 10 then 5 artifacts will be generated
  userMessagesPerSimulatedConversation?: number;
}

export interface BDDAutoPrompterParams {
  applicationOverview: string; // A high level description of the LLM based application
  relevantBddFilePaths: string[] | string; // A list of filepaths that point to the BDD files that describe a desired application behavior. If given just a string it will take all .feature files in the specified folder or just the .feature if it is provided directly
  envFilePath: string; // the path to the env file containing the LLM API keys as per .env.example
  keyTermsAndDefinitions?: { term: string; definition: string }[]; // A list of all terms and definitions which are specific to this application
  applicationLangfuseConfig?: LangfuseConfig; // if provided, will integrate with the applications langfuse project
  autoPrompterLangfuseConfig?: LangfuseConfig; // if provided, will use the specified langfuse project as a way to trace and manage the autoprompting process
  additionalBddAutoPrompterConfig?: AdditionalBddAutoPrompterConfig;
}

export interface PromptParams {
  name: string;
  content: string;
  description?: string;
}

export interface AutoPromptValidationReport {
  promptsEncountered: PromptParams[];
  validatedScenarios: BDDScenario[];
  report: string;
}
/**
 * Wrapper function to retrieve the contents of a given prompt.
 *
 * @param input.name - The name of the prompt.
 * @param input.content - The content of the prompt.
 * @param input.description - A brief description of the prompt (optional, but can improve BDD autoprompting process).
 * @returns The content of the prompt.
 */
export function bddapGetPrompt(input: PromptParams): string {
  // todo: implement logic to fetch from bddap if its not the first time getting the prompt or if bddap is not active. Maybe check this through environment variable?
  return input.content;
}

export interface ApplicationInteractionFlowProps {
  autoPrompterParams: BDDAutoPrompterParams;
  setup?: () => {};
  main: (
    autoPrompterParams: BDDAutoPrompterParams
  ) => Promise<(LLMConversationResult | LLMArtifactResult)[]>;
  teardown?: (
    generatedArtifactsAndConversations: (
      | LLMConversationResult
      | LLMArtifactResult
    )[]
  ) => Promise<void>;
}

export class BDDAutoPrompter {
  private applicationOverview: string;
  private relevantBddFilePaths: string[] | string;
  private envFilePath: string;
  public conversations?: LLMConversation[];
  public artifacts?: LLMArtifact[];
  private keyTermsAndDefinitions?: { term: string; definition: string }[];
  private applicationLangfuseConfig?: LangfuseConfig;
  private autoPrompterLangfuseConfig?: LangfuseConfig;
  private conversationsPerPersona: number = 5;
  private maxArtifactsAfterDimensionalityReduction: number = 5;
  private artifactVariabilityGeneration: number = 10;
  private userMessagesPerSimulatedConversation: number = 5;
  private bddSpecifications: BDDSpecification[] = [];
  private llmService: LLMService;

  constructor(props: BDDAutoPrompterParams) {
    this.applicationOverview = props.applicationOverview;
    this.relevantBddFilePaths = props.relevantBddFilePaths;
    this.envFilePath = props.envFilePath;
    this.keyTermsAndDefinitions = props.keyTermsAndDefinitions;
    this.applicationLangfuseConfig = props.applicationLangfuseConfig;
    this.autoPrompterLangfuseConfig = props.autoPrompterLangfuseConfig;

    const {
      conversationsPerPersona,
      maxArtifactsAfterDimensionalityReduction,
      artifactVariabilityGeneration,
      userMessagesPerSimulatedConversation,
    } = props.additionalBddAutoPrompterConfig || {};
    this.conversationsPerPersona =
      conversationsPerPersona ?? this.conversationsPerPersona;
    this.maxArtifactsAfterDimensionalityReduction =
      maxArtifactsAfterDimensionalityReduction ??
      this.maxArtifactsAfterDimensionalityReduction;
    this.artifactVariabilityGeneration =
      artifactVariabilityGeneration ?? this.artifactVariabilityGeneration;
    this.userMessagesPerSimulatedConversation =
      userMessagesPerSimulatedConversation ??
      this.userMessagesPerSimulatedConversation;

    this.llmService = new LLMService({ temperature: 0 }); // llm service used to send llm requests for the autoprompter itself
  }

  public static async initialise(
    params: BDDAutoPrompterParams
  ): Promise<BDDAutoPrompter> {
    const bddAutoPrompter = new BDDAutoPrompter(params);
    console.log(
      "Parsing BDD specs from " + bddAutoPrompter.relevantBddFilePaths
    );
    bddAutoPrompter.bddSpecifications = await parseBddSpecs(
      bddAutoPrompter.relevantBddFilePaths
    );
    return bddAutoPrompter;
  }

  public async simulateConversations(
    llmConversation: LLMConversation
  ): Promise<LLMConversationResult[]> {
    console.log("hi");
    // async local storage thing to keep track of prompts encountered
    const personas = llmConversation.likelyPersonas; // can be improved upon later by having bddap generate the personas based on the bdd spec, for now the personas are given manually
    const conversationResults: LLMConversationResult[] = [];
    const bddFeature: BDDFeature | undefined = this.bddSpecifications
      .flatMap((spec) => spec.features)
      .find(
        (feature) =>
          feature.name === llmConversation.name &&
          feature.featureCategory === "LLM Conversation"
      );
    console.log("Bdd feature for conversation: " + bddFeature);
    if (!bddFeature) {
      throw new Error(
        `Feature with name ${llmConversation.name} not found in any specification.`
      );
    }

    for (const persona of personas) {
      console.log(
        "Simulating conversation for persona: " + persona.description
      );
      for (let i = 0; i < this.conversationsPerPersona; i++) {
        const conversationId = uuidv4();
        const messages: BaseMessage[] = [];
        console.log("Simulating conversation number" + i);
        for (let j = 0; i < this.userMessagesPerSimulatedConversation; j++) {
          const userMessageGenerationPromptContent = `Below is a list of messages in a conversation between an AI and a User. You are to generate the next HumanMessage content in this conversation by simulating the response of the following persona: ${
            persona.description
          }. This persona has ${
            persona.positive ? "positive" : "negative"
          } intentions when conducting this conversation and your message should reflect this. Respond only with the simulated message content and NO OTHER TEXT.`;
          const simulatedUserMessageContent = await this.llmService.invoke([
            new SystemMessage(userMessageGenerationPromptContent),
            ...messages,
          ]);
          const aiResponse = await llmConversation.sendMessage(
            conversationId,
            simulatedUserMessageContent
          ); // note: this is one way of setting up a sendMessage function. The other way is to send in a list of all previous messages. BDDAP is chosen here to be opinionated on this logic because the logic of sending an receiving a message may be very complex under the hood but the function should only care about the interface
          messages.push(
            new HumanMessage(simulatedUserMessageContent),
            new AIMessage(aiResponse)
          );
        }
        conversationResults.push({
          conversationId,
          bddFeature,
          result: messages,
          promptsEncountered: [], // todo: implement asyncLocalStorage to find the prompts that were encountered during the conversation flow
        });
      }
    }
    return conversationResults;
  }

  public async generateArtifacts(
    artifact: LLMArtifact,
    artifactInputs: any[] // eg a list of conversation ids
  ): Promise<LLMArtifactResult[]> {
    const bddFeature: BDDFeature | undefined = this.bddSpecifications
      .flatMap((spec) => spec.features)
      .find(
        (feature) =>
          feature.name === artifact.name &&
          feature.featureCategory === "LLM Artifact"
      );

    if (!bddFeature) {
      throw new Error(
        `Feature with name ${artifact.name} not found in any specification.`
      );
    }

    const artifactResults: LLMArtifactResult[] = [];
    for (const input of artifactInputs) {
      const artifactContent = await artifact.getArtifact(input);
      artifactResults.push({
        artifactId: uuidv4(), //todo: should not generate a new id, instead it should be able to follow from previous flows. Maybe implement something like a trace id? Requires more design thinking
        bddFeature,
        result: artifactContent,
        promptsEncountered: [], // todo: implement asyncLocalStorage to find the prompts that were encountered during the conversation flow
      });
    }
    return artifactResults;
  }

  // public async artifactMaxPooling(artifacts: LLMArtifactResults[]): LLMArtifactResults[] {}

  // public async conversationMaxPooling(conversations: LLMConversationResult[]): LLMConversationResult[] {}

  // private async generatePersonas(conversation: Conversation) {}

  // private async performAutoPromptingValidation(
  //   interactionFlows: ApplicationInteractionFlow[]
  // ): Promise<AutoPromptValidationReport> {}

  // private async performAutoPromptingImprovement(
  //   report: AutoPromptValidationReport
  // ): Promise<PromptParams> {}

  // private async autoPromptingLoop() {}

  // private async updateApplicationLangfusePrompts(
  //   promptsToUpdate: PromptParams[]
  // ) {}
}
