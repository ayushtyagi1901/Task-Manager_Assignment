import { GoogleGenerativeAI } from "@google/generative-ai";

// Use GEMINI_API_KEY environment variable
const apiKey = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY; // Fallback for transition

if (!apiKey) {
  console.warn("Gemini API key not configured. LLM features may fail. Set GEMINI_API_KEY environment variable.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "dummy"); // Fallback to avoid crash if not set, will fail on call

export async function checkLLMHealth(): Promise<boolean> {
  try {
    // Test by trying to generate a simple test request
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    await model.generateContent("test");
    return true;
  } catch (e: any) {
    console.error("LLM Health check failed:", e?.message || e);
    return false;
  }
}

export async function generatePlan(spec: {
  title: string;
  goal: string;
  targetUsers: string;
  constraints: string;
  risks?: string | null;
  template?: string | null;
}) {
  const prompt = `
    You are a senior Product Manager and Tech Lead.
    Generate a development plan for the following feature request:
    
    Title: ${spec.title}
    Goal: ${spec.goal}
    Target Users: ${spec.targetUsers}
    Constraints: ${spec.constraints}
    Risks: ${spec.risks || "None specified"}
    Platform/Template: ${spec.template || "General"}

    Output strictly in JSON format with the following structure:
    {
      "userStories": [
        {
          "number": 1,
          "title": "User Story Title",
          "asA": "As a [user role/persona]",
          "iWant": "I want [specific goal/action]",
          "soThat": "so that [benefit/value]",
          "acceptanceCriteria": [
            {
              "given": "Given [context/condition]",
              "when": "when [action/trigger]",
              "then": "then [expected outcome]"
            }
          ]
        }
      ],
      "engineeringTasks": [
        { "id": "task-1", "title": "Task title", "description": "Task details", "group": "Backend/Frontend/DevOps/etc" }
      ]
    }
    
    For user stories:
    - Use the format: "As a [role], I want [goal] so that [benefit]"
    - Each user story must have at least 2-4 acceptance criteria
    - Acceptance criteria should follow Given/When/Then format
    - Make user stories specific, testable, and focused on user value
    
    For engineering tasks:
    - Ensure tasks are granular and grouped logically
    - Each task should have a clear title and description
    
    Return ONLY valid JSON, no additional text or markdown code blocks.
  `;

  // Use gemini-2.5-flash for faster responses (or gemini-2.5-pro for better quality)
  // Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", // Fast and cost-effective
  });

  // Gemini uses generateContent - combine system instruction with user prompt
  const fullPrompt = `You are a helpful senior software engineer and product manager. You output valid JSON only.

${prompt}`;

  let result;
  try {
    result = await model.generateContent(fullPrompt);
  } catch (apiError: any) {
    console.error("Gemini API Error:", apiError);
    throw new Error(`Gemini API error: ${apiError.message || JSON.stringify(apiError)}`);
  }

  const response = result.response;
  const content = response.text();
  
  if (!content) {
    throw new Error("No content generated");
  }

  // Gemini may wrap JSON in markdown code blocks, so we need to extract it
  let jsonContent = content.trim();
  
  // Remove markdown code blocks if present
  if (jsonContent.startsWith("```json")) {
    jsonContent = jsonContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (jsonContent.startsWith("```")) {
    jsonContent = jsonContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(jsonContent);
  } catch (parseError) {
    console.error("Failed to parse Gemini response as JSON:", jsonContent);
    throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
  }
}

