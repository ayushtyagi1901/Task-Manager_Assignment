# AI Implementation Notes

## Model Selection

I selected **Google Gemini 2.5 Flash** for the core logic generation.

**Why Gemini 2.5 Flash?**
- **Reasoning Capability**: It excels at breaking down high-level feature requests into granular technical tasks.
- **Structured Output**: It reliably generates JSON responses, which is critical for the application's "Task Board" feature (drag-and-drop requires structured data, not just a markdown blob).
- **Speed/Cost Balance**: Flash model offers excellent performance with fast response times, making the "Generate Plan" experience snappy while maintaining high quality.
- **Cost Effective**: Gemini Flash provides competitive pricing compared to other premium models while delivering strong results.
- **Token Capacity**: Supports up to 1 million input tokens, allowing for detailed feature specifications.

## Implementation Details

- **Integration**: Uses Google's Generative AI SDK (`@google/generative-ai`). API key is configured via `GEMINI_API_KEY` environment variable.
- **Prompt Engineering**: 
  - Used a "Persona" pattern ("You are a senior Product Manager and Tech Lead").
  - Enforced structured JSON output with specific schema for both `userStories` (array with number, title, asA, iWant, soThat, acceptanceCriteria) and `engineeringTasks` array to enable UI interactivity.
  - Requested structured user stories with Given/When/Then acceptance criteria format for better testability.
  - Clear instructions to avoid markdown code blocks in JSON responses.
- **Validation**: The backend parses the JSON response, handles markdown code block extraction if present, and handles potential errors gracefully with detailed error messages.

## Manual Review

I reviewed the generated outputs during development. The model successfully:
- Identifies implied constraints (e.g., "Mobile" template implies iOS/Android considerations).
- Groups tasks logically (e.g., "Backend", "Frontend", "DevOps").
- Generates testable user stories with proper Given/When/Then acceptance criteria.
- Creates granular, actionable engineering tasks.
- Adapts to different template types (Web, Mobile, API, Internal Tool).

## What I Checked Manually

- ✅ All user stories follow the "As a [role], I want [goal] so that [benefit]" format
- ✅ Acceptance criteria use proper Given/When/Then structure
- ✅ Engineering tasks are properly grouped and have meaningful descriptions
- ✅ JSON structure matches the expected schema
- ✅ Error handling for malformed responses
- ✅ Model availability and API compatibility
