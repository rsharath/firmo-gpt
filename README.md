# FIRMO-GPT

AI-powered firmographics search

## How It Works
Provide a company name or comma separated companies, it will respond back with the enriched json for each company. 

### Chat

Chat creates a prompt that is fed into GPT-3.5-turbo. This allows for a chat-like experience where the user can ask questions about companies and get back answers.

## Running 

### Requirements

1. Set up OpenAI

You'll need an OpenAI API key to use it.

### Acknowledgements

UI heavily builds on the work by mckay wrigley
https://github.com/mckaywrigley/wait-but-why-gpt.git

## Contact

If you have any questions, feel free to reach out to me on [Twitter](https://twitter.com/sharathr)

## Notes
Everything in the homepage component for the sake of simplicity.
Occasionally, the company won't be found and may need to be appended with a full website - this is a funky thing that is oddly due to how I have setup the System GPT prompt. 
