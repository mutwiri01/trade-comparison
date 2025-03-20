import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const HomePage = () => {
  const [country1, setCountry1] = useState("Sweden");
  const [country2, setCountry2] = useState("Mexico");
  const [indicator1, setIndicator1] = useState("GDP");
  const [indicator2, setIndicator2] = useState("Inflation Rate");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); //  loading state

  // List of indicators supported by Trading Economics
  const indicators = ["GDP", "Inflation Rate"];

  const fetchData = async () => {
    try {
      setError("");
      setIsLoading(true); // Disable the button while fetching data

      const response = await axios.get(
        "https://trade-comparison.onrender.com/compare",
        {
          params: { country1, country2, indicator1, indicator2 },
        }
      );

      console.log("API Response:", response.data);

      
      const country1Data = Array.isArray(response.data.country1)
        ? response.data.country1
        : [];
      const country2Data = Array.isArray(response.data.country2)
        ? response.data.country2
        : [];

      
      const mergedData = country1Data.map((item, index) => ({
        date: item.DateTime.split("T")[0], 
        [indicator1]: item.Value, 
        [indicator2]: country2Data[index]?.Value || "N/A", 
      }));

      // Sort mergedData by date in descending order (most recent first)
      const sortedData = mergedData.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      setData(sortedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.response?.data?.error || "Something went wrong!");
    } finally {
      setIsLoading(false); // Re-enable the button after fetching data
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-5">
      {/* Hero Section */}
      <header className="text-center py-10">
        <h1 className="text-4xl font-bold">
          Trading Economics Comparison by Mutwiri Kithinji
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Compare economic indicators between countries with real-time data.
        </p>
      </header>

      {/* Selection Section */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl">
        <div className="grid grid-cols-2 gap-6">
          {/* Country 1 Selection */}
          <div>
            <label className="block font-semibold">Country 1</label>
            <select
              className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
              value={country1}
              onChange={(e) => setCountry1(e.target.value)}
            >
              <option>Sweden</option>
              <option>Mexico</option>
              <option>Thailand</option>
            </select>
          </div>

          {/* Country 2 Selection */}
          <div>
            <label className="block font-semibold">Country 2</label>
            <select
              className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
              value={country2}
              onChange={(e) => setCountry2(e.target.value)}
            >
              <option>Sweden</option>
              <option>Mexico</option>
              <option>Thailand</option>
            </select>
          </div>

          {/* Indicator 1 Selection */}
          <div>
            <label className="block font-semibold">Indicator 1</label>
            <select
              className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
              value={indicator1}
              onChange={(e) => setIndicator1(e.target.value)}
            >
              {indicators.map((indicator, index) => (
                <option key={index} value={indicator}>
                  {indicator}
                </option>
              ))}
            </select>
          </div>

          {/* Indicator 2 Selection */}
          <div>
            <label className="block font-semibold">Indicator 2</label>
            <select
              className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
              value={indicator2}
              onChange={(e) => setIndicator2(e.target.value)}
            >
              {indicators.map((indicator, index) => (
                <option key={index} value={indicator}>
                  {indicator}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fetch Data Button */}
        <button
          onClick={fetchData}
          disabled={isLoading} // Disable the button while loading
          className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md disabled:opacity-50"
        >
          {isLoading ? "Fetching Data..." : "Compare"}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {/* Data Display */}
      {data && data.length > 0 ? (
        <div className="mt-10 max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center">
            Comparison Results
          </h2>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mt-6">
            <h3 className="text-lg font-bold text-center">Indicator Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <CartesianGrid strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey={indicator1}
                  name={`${country1} - ${indicator1}`}
                  stroke="#8884d8"
                />
                <Line
                  type="monotone"
                  dataKey={indicator2}
                  name={`${country2} - ${indicator2}`}
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">
                    {country1} ({indicator1})
                  </th>
                  <th className="py-2 px-4">
                    {country2} ({indicator2})
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-4">{item.date}</td>
                    <td className="py-2 px-4">{item[indicator1] ?? "N/A"}</td>
                    <td className="py-2 px-4">{item[indicator2] ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-4">No data available</p>
      )}
    </div>
  );
};

export default HomePage;
