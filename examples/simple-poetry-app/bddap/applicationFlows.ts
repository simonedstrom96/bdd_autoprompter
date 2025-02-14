import { autoPrompterParams } from "./bddap.config";
import { handleGeneratePoem } from "../src/server/index";
import {
  LLMArtifact,
  BDDAutoPrompter,
  ApplicationInteractionFlowProps,
} from "bdd-autoprompter";

// a flow has to take in a list of artifacts and conversations
// by the end of a flow each artifact and conversation must have corresponding results
const poemArtifact: LLMArtifact = {
  name: "Poem generation",
  description: "The poem generated by the application",
  variability: 1, // since the temperature of the poem generation is 1 we set the variability to be 1 here too
  getArtifact: handleGeneratePoem,
};

const simplePoetryApplicationFlowProps: ApplicationInteractionFlowProps = {
  autoPrompterParams,
  main: async (autoPrompterParams) => {
    const bddAutoPrompter = await BDDAutoPrompter.initialise(
      autoPrompterParams
    );
    const virtualInputs = Array.from({ length: 10 }, (_, i) => i + 1); // generate a list of 10 numbers to generate 10 random poems. Should be made more general later.
    const poemArtifacts = await bddAutoPrompter.generateArtifacts(
      poemArtifact,
      virtualInputs
    );
    return poemArtifacts;
  },
};

export default [simplePoetryApplicationFlowProps]; // only one flow for this application
