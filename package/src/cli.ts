#!/usr/bin/env node
import * as path from "path";
import * as fs from "fs";
import { ApplicationInteractionFlowProps } from "./index";

// Get the path to the applicationFlows.ts file from the command line arguments
const args = process.argv.slice(2);
const applicationFlowsPath =
  args[0] || path.join(process.cwd(), "./bddap/applicationFlows.ts");

// Check if the file exists
if (!fs.existsSync(applicationFlowsPath)) {
  console.error(`File not found: ${applicationFlowsPath}`);
  process.exit(1);
}
const flows = require(applicationFlowsPath);
const applicationFlows = flows.default;
