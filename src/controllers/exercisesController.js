// import axios from "axios";

// const API_KEY = process.env.EXERCISE_API_KEY;

// export const getExercises = async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://exercisedb.p.rapidapi.com/exercises",
//       {
//         headers: {
//           "X-RapidAPI-Key": API_KEY,
//           "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
//         },
//       }
//     );
//     res.json(response.data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch exercises" });
//   }
// };

// export const searchExercise = async (req, res) => {
//   try {
//     const name = req.params.name;

//     const response = await axios.get(
//       `https://exercisedb.p.rapidapi.com/exercises/name/${name}`,
//       {
//         headers: {
//           "X-RapidAPI-Key": API_KEY,
//           "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (err) {
//     console.error(err);
//     res.status(404).json({ message: "Exercise not found" });
//   }
// };
import axios from "axios";

const API_KEY = process.env.EXERCISE_API_KEY;

export const getExercises = async (req, res) => {
  try {
    const response = await axios.get(
      "https://exercisedb.p.rapidapi.com/exercises",
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch exercises" });
  }
};

export const searchExercise = async (req, res) => {
  try {
    const name = req.params.name;

    const response = await axios.get(
      `https://exercisedb.p.rapidapi.com/exercises/name/${name}`,
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "Exercise not found" });
  }
};
