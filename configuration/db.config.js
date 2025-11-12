var mongoose = require("mongoose");

function dbConfig() {
  const url = process.env.MONGODB_URI || "mongodb://localhost:27017/diwali-greetings";
  
  mongoose
    .connect(url)
    .then(() => {
      console.log("✅ Database connected successfully");
      console.log(`📍 Connected to: ${url.includes('localhost') ? 'Local MongoDB' : 'Cloud MongoDB'}`);
    })
    .catch((err) => {
      console.error("❌ Database connection failed:", err.message);
      console.log("💡 Make sure MongoDB is running locally or check your connection string");
    });
}

module.exports = { dbConfig };
