import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT = `You are an expert productivity planner. Create a realistic, time-blocked daily schedule based on the input tasks and constraints.

You MUST return ONLY valid JSON in this exact format:
{
  "schedule": [
    {
      "time": "HH:MM - HH:MM",
      "activity": "Activity description",
      "type": "focus" | "break" | "meeting" | "routine"
    }
  ]
}

RULES:
1. Parse the tasks and estimate durations if not provided.
2. Group related tasks if it makes sense.
3. Insert short breaks (5-10 mins) between major blocks.
4. Insert a lunch break (30-60 mins) around 12:00-13:00 if the schedule covers that time.
5. Respect the start and end times.`;

Deno.serve(async (req) => {
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

    const { tasks, startTime, endTime } = await req.json();

    if (!tasks || !startTime || !endTime) {
      return new Response(
        JSON.stringify({ error: "tasks, startTime, and endTime are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `Work Start Time: ${startTime}
Work End Time: ${endTime}

Tasks/Brain Dump:
${tasks}

Please create a daily schedule JSON based on these tasks and constraints.`;

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
