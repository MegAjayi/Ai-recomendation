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

  // useCallback: Memoize getRecommendation
  const getRecommendation = useCallback(async () => {
    dispatch({
      type: "ADD_RESPONSE",
      payload: `Genre: ${genre}, Mood: ${mood}, and level: ${level}`,
    });
  }, [genre, mood, level]);

  // useCallback: Memoize fetchRecommendations
  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) return;

    try {
      const GEMINI_API_KEY = "AIzaSyAaitFnIuiRbEjr7EcmMq9Ieg5LQJzAs2I";
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" +
          GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`,
                  },
                ],
              },
            ],
          }),
        },
      );
      const data = await response.json();
      console.log(data);

      if (data?.candidates) {
        dispatch({
          type: "ADD_MULTIPLE_RESPONSES",
          payload: data.candidates,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, [genre, mood, level]);

  return (
    <section>
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

      <button onClick={fetchRecommendations}>Get Recommendation</button>

      <br />
      <br />
      {aiResponses.map((recommend, index) => {
        return (
          <details key={index} name="recommendation">
            <summary>Recommendation {index + 1}</summary>
            <p>{recommend?.content?.[0]?.text || recommend}</p>
          </details>
        );
      })}
    </section>
  );
}
