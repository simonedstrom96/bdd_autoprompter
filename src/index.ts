import { parseBddSpecs, BDDScenario, BDDSpecification } from "./parseBddSpecs";
import { BaseMessage } from "@langchain/core/messages";

export type Persona = {
  positive: boolean; // if the persona is a positive or a negative persona. A positive persona uses the system as intended and belongs to some group. A negative persona is attempting to misuse the system as its primary purpose.
  description: string;
};

export type LLMConversation = {
  name: string;
  description: string; // The conversation description should detail what the purpose of the conversation is
  likelyPersonas: Persona[];
  sendMessage: (
    conversationId: string,
    userInputContent: string
  ) => Promise<string>; // should return an ai response upon receiving a userInput for a given conversationId
  result?: BaseMessage[]; // Filled in once a conversation is completed
};

export type LLMArtifact = {
  name: string;
  description: string;
  getArtifact: () => Promise<string>;
  variability?: number; // number 0-1 how variable the artifact generation is, corresponds to temperature for a single llm call. Defaults to 0, ie deterministic generation
  result?: string; // Filled in once an artifact is fetched
};

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

export type AutoPromptValidationReport = {
  promptsEncountered: PromptParams[];
  validatedScenarios: BDDScenario[];
  report: string;
};
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
  main: (autoPrompterParams: BDDAutoPrompterParams) => Promise<BDDAutoPrompter>;
  teardown?: () => {};
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
  private bddSpecifications: BDDSpecification[] = [];

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
    } = props.additionalBddAutoPrompterConfig || {};
    this.conversationsPerPersona =
      conversationsPerPersona ?? this.conversationsPerPersona;
    this.maxArtifactsAfterDimensionalityReduction =
      maxArtifactsAfterDimensionalityReduction ??
      this.maxArtifactsAfterDimensionalityReduction;
    this.artifactVariabilityGeneration =
      artifactVariabilityGeneration ?? this.artifactVariabilityGeneration;
  }

  public static async initialise(
    params: BDDAutoPrompterParams
  ): Promise<BDDAutoPrompter> {
    const bddAutoPrompter = new BDDAutoPrompter(params);
    bddAutoPrompter.bddSpecifications = await parseBddSpecs(
      bddAutoPrompter.relevantBddFilePaths
    );
    return bddAutoPrompter;
  }

  public async simulateConversation(conversation: LLMConversation) {}

  public async fetchArtifactContent(artifact: LLMArtifact) {
    // store artifact content before passing it on, to be used in report
    if (!this.artifacts) {
      this.artifacts = [];
    }
    const existingArtifact = this.artifacts.find(
      (a) => a.name === artifact.name
    );
    const artifactContent = await artifact.getArtifact();
    const artifactWithResult = { ...artifact, result: artifactContent };

    if (!existingArtifact) {
      this.artifacts.push(artifactWithResult);
    }
    return artifactContent;
  }

  // public async artifactMaxPooling(artifacts: Artifact[]): Artifact[] {}

  // private async generatePersonas(conversation: Conversation) {}

  // private async performAutoPromptingValidation(
  //   interactionFlows: ApplicationInteractionFlow[]
  // ): Promise<AutoPromptValidationReport> {}

  // private async performAutoPromptingImprovement(
  //   report: AutoPromptValidationReport
  // ): Promise<PromptParams> {}

  private async autoPromptingLoop() {}

  private async updateApplicationLangfusePrompts(
    promptsToUpdate: PromptParams[]
  ) {}
}

export async function applicationInteractionFlows(
  flows: ApplicationInteractionFlowProps[]
) {
  for (const flow of flows) {
    if (flow.setup) {
      await flow.setup();
    }
    const autoPrompterWithResults = await flow.main(flow.autoPrompterParams);
    const artifactsWithResults = autoPrompterWithResults.artifacts;
    const conversationsWithResults = autoPrompterWithResults.conversations;
    // evaluate artifacts and conversations according to bdd scenarios

    if (flow.teardown) {
      await flow.teardown();
    }
  }
}
