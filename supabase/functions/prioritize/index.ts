import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT = `You are an expert productivity coach and task prioritization specialist. 
Given a messy list of tasks (brain dump) and the user's current energy level, organize them into a structured, prioritized schedule.

You MUST return ONLY valid JSON in this exact format, with no additional text or markdown:
{
  "schedule": [
    {
      "title": "Task name (cleaned up and clear)",
      "priority": "High" | "Medium" | "Low",
      "estimated_minutes": number (realistic estimate),
      "category": "Category (e.g., Work, Personal, Admin, Health, Creative, Learning)",
      "reason": "Brief explanation of why this task is prioritized this way given the energy level"
    }
  ]
}

PRIORITIZATION RULES based on energy level:
- LOW energy: Start with easy, low-effort tasks like emails, organizing, simple tasks. Save hard tasks for later. Focus on quick wins.
- MEDIUM energy: Balance challenging and easy tasks. Alternate between focus-heavy and lighter tasks.
- HIGH energy: Front-load the hardest, most important, and cognitively demanding tasks. Tackle creative and complex work first.

GENERAL RULES:
- Always consider task dependencies (do preparatory tasks first)
- Group similar tasks when efficient (e.g., all emails together)
- Be realistic with time estimates
- Clean up task titles to be clear and actionable
- Maximum 10 tasks in the schedule
- If tasks are vague, interpret them reasonably`;

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
      },
    });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const { brainDump, energyLevel } = await req.json();

    if (!brainDump || !energyLevel) {
      return new Response(
        JSON.stringify({ error: "brainDump and energyLevel are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `Energy Level: ${energyLevel}

Brain Dump (raw task list):
${brainDump}

Please analyze these tasks and return a prioritized schedule as JSON.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON found in AI response");
    }

    const result = JSON.parse(match[0]);

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
