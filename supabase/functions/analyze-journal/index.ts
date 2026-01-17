import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT = `You are an expert psychologist and sentiment analyst. Analyze the given journal entry and extract mood/sentiment information.

You MUST return ONLY valid JSON in this exact format:
{
  "mood_score": number between -1.0 (very negative) and 1.0 (very positive),
  "mood_label": "happy" | "sad" | "stressed" | "calm" | "anxious" | "excited" | "tired" | "proud" | "frustrated" | "neutral",
  "entities": {
    "activities": ["activity1", "activity2"],
    "people": ["person1", "person2"],
    "places": ["place1", "place2"]
  },
  "summary": "One sentence summary of the entry"
}

RULES:
1. Be accurate about the mood score - negative events should have negative scores
2. Extract any activities mentioned (e.g., "fixed a bug", "went for a walk", "had a meeting")
3. Extract people mentioned (e.g., "mom", "boss", "friend")
4. Extract places mentioned (e.g., "work", "home", "gym")
5. Arrays can be empty if nothing is mentioned`;

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

    const { content } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "content is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `Journal Entry:
${content}

Please analyze this journal entry and return the mood analysis as JSON.`;

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
