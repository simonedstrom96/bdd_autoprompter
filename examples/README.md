# BDD Autoprompter examples

This folder contains some example fullstack applications that illustrate the usage of BDD AutoPrompter.

## Usage

From root run `cp ./examples/shared/server/.env.example ./examples/shared/server/.env`

Fill out the necessary environment variables in `./examples/shared/server/.env`.
Note that you only need to fill in the variables for one LLM provider (eg OpenAI or Azure OpenAI).

From root run `cd examples && npm install`

Run `npm run start:app1` or whichever example you prefer to start the app in dev mode which will run the app on `localhost:8080` for you to interact with in the browser. This is mainly to get a feel for what the example app does.
