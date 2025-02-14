# BDD Autoprompter examples

This folder contains some example fullstack applications that illustrate the usage of BDD AutoPrompter.

All applications here are meant to be simple illustrative examples of how to use the tool and would of course need more work to be considered fully fledged fullstack applications.

## Usage

From root run `cp ./examples/shared/server/.env.example ./examples/shared/server/.env`

Fill out the necessary environment variables in `./examples/shared/server/.env`.
Note that you only need to fill in the variables for one LLM provider (eg OpenAI or Azure OpenAI).

From project root run `npm run dev1` or whichever example you prefer to start the app in dev mode which will run the app on `localhost:3000` for you to interact with in the browser. This is mainly to get a feel for what the example app does.

For each project, see folders `bdd` and `bddap` to see how the BDD specs are written and how the BDD AutoPrompter is set up.
