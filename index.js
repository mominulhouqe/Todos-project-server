const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json()); // Add this line to parse JSON request bodies

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// MongoDB connection URI
const uri =
  "mongodb+srv://test-task:M4twd86A5cEEGYLu@cluster0.34btmna.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Define async function to run the server
async function run() {
  try {
    // Uncomment the following line to establish a connection to MongoDB
    // await client.connect();

    // Get a reference to the "todos" collection in the "api" database
    const TodoCollection = client.db("api").collection("todos");

    // Get all todos
    app.get("/api/todos", async (req, res) => {
      const cursor = TodoCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add a new todo
    app.post("/api/todos", async (req, res) => {
      const addedTodo = req.body;
      const result = await TodoCollection.insertOne(addedTodo);
      res.send(result);
    });

    // Get a specific todo by ID
    app.get("/api/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await TodoCollection.findOne(query);
      res.send(result);
    });

    // Update a specific todo by ID
    app.put("/api/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDescription = req.body;
      const updatedDescription = {
        $set: {
          text: updateDescription.text,
        },
      };
      const result = await TodoCollection.updateOne(
        query,
        updatedDescription,
        options
      );
      res.send(result);
    });

    // Delete a specific todo by ID
    app.delete("/api/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await TodoCollection.deleteOne(query);
      res.send(result);
    });

    // Ping MongoDB to check the connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensure to close the client when done (uncomment when needed)
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
