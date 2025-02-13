type Persona = {
  positive: boolean; // if the persona is a positive or a negative persona. A positive persona uses the system as intended and belongs to some group. A negative persona is attempting to misuse the system as its primary purpose.
  description: string;
};

type Conversation = {
  name: string;
  description: string; // The conversation description should detail what the purpose of the conversation is
  likelyPersonas: Persona[];
  sendMessage: (conversationId: string, userInput: string) => string; // should return an ai response upon receiving a userInput for a given conversationId
};

type Artifact = {
  name: string;
  description: string;
  getArtifact: () => string;
};

interface LangfuseConfig {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
  additionalLangfuseConfig?: Object;
}

interface AdditionalBddAutoPrompterConfig {
  conversationsPerPersona?: number;
  dimensionalityReductionNumber?: number;
}

interface BDDAutoPrompterParams {
  applicationOverview: string; // A high level description of the LLM based application
  relevantBddFilePaths: string[] | string; // A list of filepaths that point to the BDD files that describe a desired application behavior. If given just a string it will take all .feature files in the specified folder or just the .feature if it is provided directly
  envFilePath: string; // the path to the env file containing the LLM API keys as per .env.example
  conversations?: Conversation[];
  artifacts?: Artifact[];
  keyTermsAndDefinitions?: { term: string; definition: string }[]; // A list of all terms and definitions which are specific to this application
  applicationLangfuseConfig?: LangfuseConfig; // if provided, will integrate with the applications langfuse project
  autoPrompterLangfuseConfig?: LangfuseConfig; // if provided, will use the specified langfuse project as a way to trace and manage the autoprompting process
  additionalBddAutoPrompterConfig?: AdditionalBddAutoPrompterConfig;
}

type ApplicationInteractionFlow = {
  setup: () => any;
  main: () => any;
  teardown: () => any;
};

type BDDScenario = {
  threshold: number;
  description: string;
  content: string[];
  validationResultDescription?: string;
  validationScoringResult?: number;
};

// BDD file in a structured format
type BDDSpecification = {
  features: {
    description: string;
    llmBehaviourFeature: boolean; // does the feature describe LLM behavior or not indicated by beggining the feature description with [LLM behavior]
    background: string;
    scenarios: BDDScenario[];
  }[];
};

interface PromptParams {
  name: string;
  content: string;
  description?: string;
}

type AutoPromptValidationReport = {
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

export class BDDAutoprompter {

  private applicationOverview: string;
  private relevantBddFilePaths: string[] | string;
  private envFilePath: string;
  private conversations?: Conversation[];
  private artifacts?: Artifact[];
  private keyTermsAndDefinitions?: { term: string; definition: string }[];
  private applicationLangfuseConfig?: LangfuseConfig;
  private autoPrompterLangfuseConfig?: LangfuseConfig;
  private additionalBddAutoPrompterConfig?: AdditionalBddAutoPrompterConfig;

  constructor(props: BDDAutoPrompterParams) {
    this.applicationOverview = props.applicationOverview;
    this.relevantBddFilePaths = props.relevantBddFilePaths;
    this.envFilePath = props.envFilePath;
    this.conversations = props.conversations;
    this.artifacts = props.artifacts;
    this.keyTermsAndDefinitions = props.keyTermsAndDefinitions;
    this.applicationLangfuseConfig = props.applicationLangfuseConfig;
    this.autoPrompterLangfuseConfig = props.autoPrompterLangfuseConfig;
    this.additionalBddAutoPrompterConfig = props.additionalBddAutoPrompterConfig;
  }

  public async simulateConversation(
    conversation: Conversation,
    personas: Persona[]
  ) {}

  //   public async artifactMaxPooling(artifacts: Artifact[]): Artifact[] {}

  private async parseBddSpecs(
    bddSpecFilePaths: string[]
  ): Promise<BDDSpecification[]> {}

  private async generatePersonas(conversation: Conversation) {}

  private async performAutoPromptingValidation(
    interactionFlows: ApplicationInteractionFlow[]
  ): Promise<AutoPromptValidationReport> {}

  private async performAutoPromptingImprovement(
    report: AutoPromptValidationReport
  ): Promise<PromptParams> {}

  private async autoPromptingLoop(){}

  private async updateApplicationLangfusePrompts(promptsToUpdate:PromptParams[]){}
}
