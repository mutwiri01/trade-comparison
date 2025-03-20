require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY; // Store API key in .env file

// Allowed free countries
const FREE_COUNTRIES = ["Sweden", "Mexico", "New Zealand", "Thailand"];

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/compare", async (req, res) => {
  try {
    let { country1, country2, indicator1, indicator2 } = req.query;

    // Ensure country names are capitalized correctly
    country1 =
      country1.charAt(0).toUpperCase() + country1.slice(1).toLowerCase();
    country2 =
      country2.charAt(0).toUpperCase() + country2.slice(1).toLowerCase();

    // Validate that only free countries are used
    if (
      !FREE_COUNTRIES.includes(country1) ||
      !FREE_COUNTRIES.includes(country2)
    ) {
      return res.status(400).json({
        error:
          "Only Sweden, Mexico, New Zealand, and Thailand are allowed for free users.",
      });
    }

    // Fetch data for country1 and indicator1
    const response1 = await axios.get(
      `https://api.tradingeconomics.com/historical/country/${country1}/indicator/${indicator1}?c=${API_KEY}`
    );

    // Fetch data for country2 and indicator2
    const response2 = await axios.get(
      `https://api.tradingeconomics.com/historical/country/${country2}/indicator/${indicator2}?c=${API_KEY}`
    );

    // Sort data by date in descending order (most recent first)
    const sortedCountry1Data = response1.data.sort((a, b) => {
      return new Date(b.DateTime) - new Date(a.DateTime);
    });

    const sortedCountry2Data = response2.data.sort((a, b) => {
      return new Date(b.DateTime) - new Date(a.DateTime);
    });

    // Send the sorted data back to the frontend
    res.json({ country1: sortedCountry1Data, country2: sortedCountry2Data });
  } catch (error) {
    console.error("Error fetching data from Trading Economics API:", error);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
