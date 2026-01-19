import React, { useEffect, useReducer, useCallback } from "react";

// Reducer function
const aiResponsesReducer = (state, action) => {
  switch (action.type) {
    case "ADD_RESPONSE":
      return [...state, action.payload];
    case "ADD_MULTIPLE_RESPONSES":
      return [...state, ...action.payload];
    case "CLEAR_RESPONSES":
      return [];
    default:
      return state;
  }
};

export default function App() {
  const [genre, setGenre] = React.useState("");
  const [mood, setMood] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [aiResponses, dispatch] = useReducer(aiResponsesReducer, []);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

  const availableMoodBasedOnGenre = listOfMoodOption[genre];

  // useEffect: Reset mood when genre changes
  useEffect(() => {
    setMood("");
  }, [genre]);

  // useEffect: Log when selections are complete
  useEffect(() => {
    if (genre && mood && level) {
      console.log("All selections complete:", { genre, mood, level });
    }
  }, [genre, mood, level]);

  // useCallback: Memoize fetchRecommendations
  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) {
      setError("Please select all options");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. For each book, provide the title, author, and a brief explanation of why it's suitable. Format your response clearly.`,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data?.candidates && data.candidates.length > 0) {
        dispatch({
          type: "ADD_MULTIPLE_RESPONSES",
          payload: data.candidates,
        });
      } else {
        setError("No recommendations received. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(
        err.message || "Failed to fetch recommendations. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [genre, mood, level, GEMINI_API_KEY]);

  return (
    <section>
      <h1>AI Book Recommendation</h1>

      <SelectField
        placeholder="Please select a genre"
        id="genre"
        options={listOfGenreOption}
        onSelect={setGenre}
        value={genre}
      />

      <SelectField
        placeholder="Please select a mood"
        id="mood"
        options={availableMoodBasedOnGenre || []}
        onSelect={setMood}
        value={mood}
      />

      <SelectField
        placeholder="Please select a level"
        id="level"
        options={["Beginner", "Intermediate", "Expert"]}
        onSelect={setLevel}
        value={level}
      />

      <button
        onClick={fetchRecommendations}
        disabled={!genre || !mood || !level || isLoading}
      >
        {isLoading ? "Loading..." : "Get Recommendation"}
      </button>

      {error && (
        <div style={{ color: "red", margin: "20px 0" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <br />
      <br />

      {aiResponses.length > 0 && (
        <div>
          <h2>Recommendations:</h2>
          {aiResponses.map((recommend, index) => (
            <details
              key={index}
              name="recommendation"
              style={{ marginBottom: "10px" }}
            >
              <summary>Recommendation {index + 1}</summary>
              <div style={{ padding: "15px", whiteSpace: "pre-wrap" }}>
                {recommend?.content?.parts?.[0]?.text || "No content available"}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
