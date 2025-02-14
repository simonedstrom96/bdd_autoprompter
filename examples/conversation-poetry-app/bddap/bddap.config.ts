import { BDDAutoPrompterParams } from "bdd-autoprompter";

const applicationOverview =
  "This is a simple application that just generates a random poem";

const relevantBddFilePaths = __dirname + "../bdd";

const envFilePath = __dirname + "/../../shared/server/.env"; // here using the same env file as the example applications but in practice this would be a separate file stored somewhere in the project

export const autoPrompterParams: BDDAutoPrompterParams = {
  applicationOverview,
  relevantBddFilePaths,
  envFilePath,
};

export default autoPrompterParams;
