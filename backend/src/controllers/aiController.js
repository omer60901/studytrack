import OpenAI from "openai";

function fallbackPlan(prompt) {
  return {
    title: "Personalized Study Plan",
    summary: `Generated for: ${prompt}`,
    days: [
      { day: 1, goal: "Map the syllabus and identify weak topics", sessions: ["45 min concept review", "25 min practice set"] },
      { day: 2, goal: "Build foundations", sessions: ["50 min focused reading", "30 min active recall"] },
      { day: 3, goal: "Practice medium difficulty questions", sessions: ["60 min problem solving", "20 min error log"] },
      { day: 4, goal: "Target weak areas", sessions: ["45 min topic drills", "30 min flashcards"] },
      { day: 5, goal: "Simulate exam conditions", sessions: ["90 min mock exam", "30 min corrections"] },
      { day: 6, goal: "Review high-yield material", sessions: ["50 min summaries", "25 min formula/key fact recall"] },
      { day: 7, goal: "Light final review and rest", sessions: ["35 min confidence review", "10 min checklist"] }
    ],
    recommendations: ["Use active recall", "Review mistakes daily", "Sleep at least 7 hours before the exam"]
  };
}

export async function generatePlan(req, res) {
  const { prompt } = req.body;
  if (!process.env.OPENAI_API_KEY) return res.json(fallbackPlan(prompt));

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Return concise JSON for a student study plan with title, summary, days, recommendations." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  res.json(JSON.parse(completion.choices[0].message.content));
}
