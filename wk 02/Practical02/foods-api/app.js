const express = require("express");
const app = express();
const PORT = 3000;
app.use(express.json());

app.get("/hello", (req, res) => {
  res.send("Hello, world!");
});

let foods = [];

app.post("/foods", (req, res) => {
  const { name, calories } = req.body;
  if (!name || calories == null) { // checks both name or calories - if either is missing then reply with 400
    return res
      .status(400)
      .json({ message: "Cannot create food: name and calories are required." });
  }
  const newFood = { id: Date.now(), name, calories }; // id: means id is generated with current date & time
  foods.push(newFood); // adds everything into the foods array
  res
    .status(201)
    .json({ message: "Food created successfully.", food: newFood });
});

app.get("/foods", (req, res) => {
  const { name } = req.query; // req.query means it's optional to put names at the back, {} only used for req.query
  let results = foods;
  if (name) { // if name is provided
    results = foods.filter((f) => f.name.includes(name)); // f = function, represents one food item at a time (for this scenario)
    return res.json({
      message: `Found ${results.length} food(s) matching name filter.`,
      foods: results,
    });
  }
  res.json({
    message: `Retrieved all foods (${results.length}).`,
    foods: results,
  });
});

app.put("/foods/:id", (req, res) => {
  const foodId = Number(req.params.id); // updates existing food item
  const { name, calories } = req.body;
  if (!name || calories == null) { // ! = not
    return res
      .status(400)
      .json({ message: "Cannot update: name and calories are required." });
  }
  const idx = foods.findIndex((f) => f.id === foodId); // finding index
  if (idx === -1) { // -1 = not available, == or === means okay
    return res
      .status(404)
      .json({ message: `No food found with id ${foodId}.` });
  }
  foods[idx] = { id: foodId, name, calories }; // if food is found, update the food item at that index with new values
  res.json({ // id: = key, foodId = value
    message: `Food with id ${foodId} updated successfully.`,
    food: foods[idx],
  });
});

app.delete("/foods/:id", (req, res) => {
  const foodId = Number(req.params.id); // Number is the conversion from string to number
  const exists = foods.some((f) => f.id === foodId); // some = going through the array, returning at least one item that matches
  if (!exists) { 
    return res
      .status(404)
      .json({ message: `No food found with id ${foodId}.` });
  }
  foods = foods.filter((f) => f.id !== foodId); // !== means not equals to, I want to Keep all foods whose ID is NOT equal to foodId
  res.json({ message: `Food with id ${foodId} deleted successfully.` });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

