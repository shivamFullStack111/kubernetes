const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config()

const app = express();
app.use(cors());
app.use(express.json());

console.log(`mongo url is ${process.env.MONGO_URL}`)
// ✅ MongoDB Connection
mongoose.connect(`${process.env.MONGO_URL}`)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// ✅ Schema & Model
const TodoSchema = new mongoose.Schema({
  task: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const Todo = mongoose.model("Todo", TodoSchema);

// ✅ Routes


app.get("/", async (req, res) => {
  return res.send({success:true,message:"Backend running"})
});


// Get all todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new todo
app.post("/api/todos", async (req, res) => {
  try {
    const todo = new Todo(req.body);
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update todo (edit text or toggle complete)
app.put("/api/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
