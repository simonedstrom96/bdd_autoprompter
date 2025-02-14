import { BDDAutoPrompterParams } from "bdd-autoprompter";

const applicationOverview =
  "In this application users can chat with an agent that guides them in creating a good poem. When the user feels ready to generate the poem they can click a button and a poem based on the conversation will be generated for them.";

const relevantBddFilePaths = __dirname + "../bdd";

const envFilePath = __dirname + "/../../shared/server/.env"; // here using the same env file as the example applications but in practice this would be a separate file stored somewhere in the project

export const autoPrompterParams: BDDAutoPrompterParams = {
  applicationOverview,
  relevantBddFilePaths,
  envFilePath,
};

export default autoPrompterParams;
