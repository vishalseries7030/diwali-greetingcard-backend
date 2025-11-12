var express = require("express");
const { buildPrompt } = require("../utils/build.prompt");
const { text } = require("body-parser");
const { isLoggedIn } = require("../middlewares/user.middlware");
var geminiRouter = express.Router();

geminiRouter.post("/generate", isLoggedIn, async (req, res) => {
  const { name, language, tone } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name required" });
  let gemini_key = process.env.GEMINI_API_KEY;
  if (!gemini_key) {
    return res.json({ Message: "Kindly put your gemini key" });
  }
  try {
    const prompt = buildPrompt(name, language, tone);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": `${gemini_key}`,
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (response.ok) {
      // console.log(response.json());
      const data = await response.json();
      const greeting =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "No responses";
      res.json({ Message: "Fetched", data: greeting });
    }
  } catch (error) {
    res
      .status(500)
      .json({ Message: "Something went Wrong", Status: `error ${error}` });
  }
});

module.exports = { geminiRouter };
