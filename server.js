var express = require("express");
var app = express();
var cors = require("cors");
var dotenv = require("dotenv");
const { dbConfig } = require("./configuration/db.config");
const { userRouter } = require("./routers/user.router");
const bodyParser = require("body-parser");
const { geminiRouter } = require("./routers/gemini.router");
var cookieParser = require("cookie-parser");

dotenv.config();

// middlwares
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://diwali-greetingcard-backend.onrender.com"
      ];
      
      // Allow Vercel domains
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Diwali Greeting API is running! 🪔",
    endpoints: {
      user: "/api/v1/user",
      gemini: "/api/v1/gemini"
    }
  });
});

// API health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/gemini", geminiRouter);

var PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  await dbConfig();
  console.log(`Listening to the port ${PORT}`);
});
