var express = require("express");
const { buildPrompt } = require("../utils/build.prompt");
const { text } = require("body-parser");
const { isLoggedIn } = require("../middlewares/user.middlware");
var geminiRouter = express.Router();

// Helper function for retry with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      // If successful, return immediately
      if (response.ok) {
        return { response, data };
      }
      
      // If 503 (overloaded) and not last retry, wait and retry
      if (response.status === 503 && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`Gemini API overloaded. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // For other errors or last retry, return the error
      return { response, data };
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const waitTime = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

geminiRouter.post("/generate", isLoggedIn, async (req, res) => {
  const { name, language, tone } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name required" });
  let gemini_key = process.env.GEMINI_API_KEY;
  if (!gemini_key) {
    return res.json({ Message: "Kindly put your gemini key" });
  }
  try {
    const prompt = buildPrompt(name, language, tone);
    
    const { response, data } = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${gemini_key}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ 
        Message: "Gemini API Error", 
        error: data.error?.message || "Failed to generate greeting. Please try again." 
      });
    }

    const greeting =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No responses";
    res.json({ Message: "Fetched", data: greeting });
  } catch (error) {
    res
      .status(500)
      .json({ Message: "Something went Wrong", Status: `error ${error}` });
  }
});

module.exports = { geminiRouter };
