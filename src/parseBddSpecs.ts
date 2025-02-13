import * as fs from "fs";
import * as readline from "readline";

export type BDDScenario = {
  threshold?: number;
  description: string;
  content: string[];
  validationResultDescription?: string;
  validationScoringResult?: number;
};

// BDD file in a structured format
export type BDDSpecification = {
  features: {
    description: string;
    llmBehaviourFeature: boolean; // does the feature describe LLM behavior or not indicated by beggining the feature description with [LLM behavior]
    background: string;
    scenarios: BDDScenario[];
  }[];
};

export async function parseBddSpecs(
  bddSpecFilePaths: string[] | string
): Promise<BDDSpecification[]> {
  let filePaths;
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
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let currentFeature: any = null;
    let currentScenario: any = null;

    for await (const line of rl) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("Feature:")) {
        if (currentScenario && currentFeature) {
          currentFeature.scenarios.push(currentScenario);
        }
        if (currentFeature) {
          bddSpecifications.push(currentFeature);
        }
        currentFeature = {
          description: trimmedLine.replace("Feature:", "").trim(),
          llmBehaviourFeature: trimmedLine.includes("[LLM behavior]"),
          background: "",
          scenarios: [],
        };
        currentScenario = null;
      } else if (trimmedLine.startsWith("Background:")) {
        if (currentFeature) {
          currentFeature.background = trimmedLine
            .replace("Background:", "")
            .trim();
        }
      } else if (trimmedLine.startsWith("Scenario:")) {
        if (currentScenario && currentFeature) {
          currentFeature.scenarios.push(currentScenario);
        }
        const match = trimmedLine.match(/\((\d+)\/(\d+)\)/);
        let description = trimmedLine.replace("Scenario:", "").trim();
        let threshold;
        if (match) {
          const numerator = parseInt(match[1], 10);
          const denominator = parseInt(match[2], 10);
          threshold = (numerator / denominator) * 10;
          description = description.replace(match[0], "").trim();
        }
        currentScenario = {
          description,
          threshold,
          content: [],
        };
      } else if (currentScenario && trimmedLine.length > 0) {
        currentScenario.content.push(trimmedLine);
      }
    }

    if (currentScenario && currentFeature) {
      currentFeature.scenarios.push(currentScenario);
    }
    if (currentFeature) {
      bddSpecifications.push(currentFeature);
    }
  }

  return bddSpecifications;
}
