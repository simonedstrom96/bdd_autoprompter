import * as fs from "fs";
import * as readline from "readline";

export type BDDScenario = {
  threshold?: number;
  description: string;
  content: string[];
  validationResultDescription?: string;
  validationScoringResult?: number;
};

export type BDDFeature = {
  name: string;
  featureCategory: "LLM Conversation" | "LLM Artifact" | "Non-LLM";
  background: string;
  scenarios: BDDScenario[];
};

export type BDDSpecification = {
  features: BDDFeature[];
};

export async function parseBddSpecs(
  bddSpecFilePaths: string[] | string
): Promise<BDDSpecification[]> {
  let filePaths: string[];
  if (typeof bddSpecFilePaths === "string") {
    if (bddSpecFilePaths.endsWith(".feature")) {
      filePaths = [bddSpecFilePaths];
    } else {
      const files = fs.readdirSync(bddSpecFilePaths);
      filePaths = files
        .filter((file) => file.endsWith(".feature"))
        .map((file) => `${bddSpecFilePaths}/${file}`);
    }
  } else {
    filePaths = bddSpecFilePaths;
  }

  const bddSpecifications: BDDSpecification[] = [];

  for (const filePath of filePaths) {
    const fileFeatures: BDDFeature[] = [];
    let currentFeature: BDDFeature | null = null;
    let currentScenario: BDDScenario | null = null;

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("Feature:")) {
        // Before starting a new feature, push any pending scenario.
        if (currentScenario && currentFeature) {
          currentFeature.scenarios.push(currentScenario);
          currentScenario = null;
        }
        // If a previous feature exists, push it into fileFeatures.
        if (currentFeature) {
          fileFeatures.push(currentFeature);
        }

        // Remove the prefix and check for new markers.
        let featureName = trimmedLine.replace("Feature:", "").trim();
        let featureCategory: "LLM Conversation" | "LLM Artifact" | "Non-LLM" =
          "Non-LLM";

        if (featureName.includes("[LLM Conversation]")) {
          featureCategory = "LLM Conversation";
          featureName = featureName.replace("[LLM Conversation]", "").trim();
        } else if (featureName.includes("[LLM Artifact]")) {
          featureCategory = "LLM Artifact";
          featureName = featureName.replace("[LLM Artifact]", "").trim();
        }

        currentFeature = {
          name: featureName,
          featureCategory,
          background: "",
          scenarios: [],
        };
      } else if (trimmedLine.startsWith("Background:")) {
        if (currentFeature) {
          currentFeature.background = trimmedLine
            .replace("Background:", "")
            .trim();
        }
      } else if (trimmedLine.startsWith("Scenario:")) {
        // Before starting a new scenario, push any pending one.
        if (currentScenario && currentFeature) {
          currentFeature.scenarios.push(currentScenario);
        }

        const scenarioLine = trimmedLine.replace("Scenario:", "").trim();
        const match = scenarioLine.match(/\((\d+)\/(\d+)\)/);
        let threshold;
        let scenarioDescription = scenarioLine;
        if (match) {
          const numerator = parseInt(match[1], 10);
          const denominator = parseInt(match[2], 10);
          threshold = (numerator / denominator) * 10;
          scenarioDescription = scenarioDescription.replace(match[0], "").trim();
        }
        currentScenario = {
          description: scenarioDescription,
          threshold,
          content: [],
        };
      } else if (currentScenario && trimmedLine.length > 0) {
        currentScenario.content.push(trimmedLine);
      }
    }

    // After finishing the file, push any pending scenario.
    if (currentScenario && currentFeature) {
      currentFeature.scenarios.push(currentScenario);
    }
    // If there's a pending feature, push it into fileFeatures.
    if (currentFeature) {
      fileFeatures.push(currentFeature);
    }
    // Create a BDDSpecification for this file.
    bddSpecifications.push({ features: fileFeatures });
  }

  return bddSpecifications;
}

// Test harness: Only runs if this file is executed directly.
if (require.main === module) {
  (async () => {
    const inputPath = process.argv[2] || "./sample.feature";
    try {
      const specs = await parseBddSpecs(inputPath);
      console.log("Parsed BDD Specifications:");
      console.log(JSON.stringify(specs, null, 2));
    } catch (err) {
      console.error("Error parsing BDD specs:", err);
    }
  })();
}