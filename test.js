const axios = require("axios");

async function send() {
  try {
    await axios.post("https://hooks.zapier.com/hooks/catch/25569131/ufszo40/", {
      quote: "Test quote",
      author: "HappyVibes User",
      timestamp: new Date().toISOString(),
    });
    console.log("Test sent successfully!");
  } catch (error) {
    console.error("Send failed:", error.message);
  }
}

send();
