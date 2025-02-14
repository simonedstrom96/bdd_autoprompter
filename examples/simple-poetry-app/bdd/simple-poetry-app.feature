Feature: Simple poetry App

    Background: A user has just accessed the simple poetry app

    Scenario: Generate a poem
        Given The user is on the poetry generation page
        When The user presses the "Generate Poem" button
        Then a new poem should be displayed on the screen

Feature: [LLM behavior] [Artifact] Poem generation

    Background: The purpose of the poetry application is to generate nice, happy and short poems for all users who click the "Generate poem" button.

    Scenario: (8/10) The app produces a short poem
        When the user presses the button to generate the poem
        Then the poem should be generated and it should be a short poem