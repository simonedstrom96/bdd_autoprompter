#!/usr/bin/env node
import * as dotenv from "dotenv";
import bddapConfig from "../../examples/conversation-poetry-app/bddap/bddap.config";
dotenv.config({ path: bddapConfig.envFilePath });

import {
  ApplicationInteractionFlowProps,
  LLMArtifactResult,
  LLMConversationResult,
} from "./index";

import applicationFlows2 from "../../examples/conversation-poetry-app/bddap/applicationFlows"; // todo: get this dynamically from the given project, not hardcoded

const applicationFlows: ApplicationInteractionFlowProps[] = applicationFlows2;

(async () => {
  let allGeneratedArtifactsAndConversations: (
    | LLMConversationResult
    | LLMArtifactResult
  )[] = [];
  for (const applicationFlow of applicationFlows) {
    if (applicationFlow.setup) {
      console.log("Performing interaction flow setup");
      applicationFlow.setup();
    }
    console.log(
      `Running interaction flow ${applicationFlows.indexOf(applicationFlow)}`
    );
    const generatedArtifactsAndConversations = await applicationFlow.main(
      applicationFlow.autoPrompterParams
    );
    allGeneratedArtifactsAndConversations.push(
      ...generatedArtifactsAndConversations
    );
    if (applicationFlow.teardown) {
      console.log("Performing interaction flow teardown");
      await applicationFlow.teardown(generatedArtifactsAndConversations);
    }
  }
  console.log(JSON.stringify(allGeneratedArtifactsAndConversations, null, 2));
})();
