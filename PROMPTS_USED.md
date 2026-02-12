# Prompts Used

## Plan Generation Prompt

Used in `server/gemini.ts` to generate the User Stories and Engineering Tasks.

**System Instruction:**
```
You are a helpful senior software engineer and product manager. You output valid JSON only.
```

**User Prompt:**
```
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
```

**Notes:**
- The prompt is designed to generate structured data that can be directly used in the UI
- User stories are formatted for card-based display with acceptance criteria
- Engineering tasks support drag-and-drop reordering
- The model used is Gemini 2.5 Flash for fast, reliable responses
