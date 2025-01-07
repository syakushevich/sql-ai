import { getEdgeRuntimeResponse } from "@assistant-ui/react/edge";
require("dotenv").config();
import { openai } from "@ai-sdk/openai";
const OpenAI = require("openai");
const { executeQuery, listColumnsAndConstraints } = require("./db");

// Configure OpenAI API
const openai_api = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to call OpenAI
async function requestOpenAi(messages) {
  const response = await openai_api.chat.completions.create({
    model: "gpt-4o",
    messages,
  });

  let content = response.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Invalid response from OpenAI: No valid content found.");

  if (content.startsWith("```") && content.endsWith("```")) {
    content = content.replace(/^```[a-z]*\n/, "").replace(/```$/, "").trim();
  }

  return content;
}

// Extract user input from the request body
function extractUserInput(requestBody) {
  return requestBody?.messages
    ?.filter((msg) => msg.role === "user" && msg.content?.[0]?.type === "text")
    ?.map((msg) => msg.content?.[0]?.text?.trim())
    ?.filter((text) => text)
    ?.pop();
}

// Generate SQL query using OpenAI
async function generateSQLQuery(userInput, sqlMetadata) {
  // Format the metadata into a readable JSON structure
  const formattedMetadata = JSON.stringify(sqlMetadata, null, 2);

  // Updated prompt with explicit guidance
  const query = await requestOpenAi([
    {
      role: "system",
      content: `
        You are a database assistant with metadata about the database schema.
        The metadata includes table names, columns, data types, and constraints.
        Assume the user has appropriate permissions to perform queries.
        Always return only the SQL query in response, without any additional text or explanations.

        Here is the database metadata:
        \`\`\`json
        ${formattedMetadata}
        \`\`\`
      `,
    },
    {
      role: "user",
      content: `Generate a SQL query for the following request: ${userInput}`,
    },
  ]);
  return query;
}


// Prepare data for Edge Runtime
function prepareEdgeRequestData(sqlResults) {
  return {
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `\`\`\`json\n${JSON.stringify(sqlResults, null, 2)}\n\`\`\`\n\nPlease format the above data in a readable code block.`,
          },
        ],
      },
    ],
    tools: [],
    unstable_assistantMessageId: "W78GRUw",
  };
}


// Handle POST request
export const POST = async (request) => {
  try {
    const requestBody = await request.json();
    const userInput = extractUserInput(requestBody);
    if (!userInput) throw new Error("User input is required and must be a non-empty string.");

    const sqlMetadata = await listColumnsAndConstraints();
    const query = await generateSQLQuery(userInput);
    const sqlResults = await executeQuery(query);
    const requestData = prepareEdgeRequestData(sqlResults);

    return await getEdgeRuntimeResponse({
      options: {
        model: openai("gpt-4o"),
      },
      requestData,
      abortSignal: null,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to process the request.",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
