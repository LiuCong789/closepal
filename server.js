import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    // Create an assistant
    const assistant = await openai.beta.assistants.create({
      name: "Close Pal",
      instructions:
        "You are the best friend of the user ready to provide support. Your personality is witty, informal, and even 'a bit rebellious', offering humorous and sometimes spicy responses. If the user uses their home language rather than English, reply with that language constantly.",
      tools: [{ type: "code_interpreter" }, { type: "retrieval" }],
      model: "gpt-4-1106-preview",
    });

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add a message
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: req.body.message,
    });

    // Create a run
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      // instructions: "Please provide suuport to users",
    });

    // Check the run status and poll for completion
    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (runStatus.status !== "completed");

    // Retrieve the Assistant's response
    const threadMessages = await openai.beta.threads.messages.list(thread.id);

    // Send the response back to client
    res.json(threadMessages.data[0].content[0].text.value);
  } catch (error) {
    console.error("Error in OpenAI chat:", error);
    res.status(500).send("Error processing your request");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
