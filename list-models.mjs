// list-models.mjs
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY. Set it, then re-run.");
  process.exit(1);
}
const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
(async () => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
    }
    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models : [];
    if (models.length === 0) {
      console.log("No models returned. Check API key/project permissions.");
      return;
    }
    console.log("Available models (supports generateContent marked with ✅):\n");
    for (const m of models) {
      const fullName = m.name || "";
      const id = fullName.startsWith("models/") ? fullName.slice(7) : fullName;
      const supports = Array.isArray(m.supportedGenerationMethods) ? m.supportedGenerationMethods : [];
      const canGenerate = supports.includes("generateContent");
      console.log(`- ${id} ${canGenerate ? "✅" : "❌"}`);
    }
    console.log("\nPick a ✅ model and set GEMINI_MODEL in backend/.env.");
  } catch (err) {
    console.error("Failed to list models:", err.message || err);
    process.exit(1);
  }
})();