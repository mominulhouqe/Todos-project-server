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

const uri =
  "mongodb+srv://test-task:M4twd86A5cEEGYLu@cluster0.34btmna.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const TodoCollection = client.db("api").collection("todos");

    // Inserted Gallary section

    app.get("/api/todos", async (req, res) => {
      const cursor = TodoCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

 
    // Insert a new toy
    app.post("/api/todos", async (req, res) => {
      const addedToy = req.body;
      const result = await TodoCollection.insertOne(addedToy);
      res.send(result);
    });

    // updating

    app.get("/api/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await TodoCollection.findOne(query);
      res.send(result);
    });

    app.put("/api/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDescrition = req.body;
      const updatedDescrition = {
        $set: {
          text: updateDescrition.text,
        },
      };
      const result = await TodoCollection.updateOne(
        query,
        updatedDescrition,
        options
      );
      res.send(result);
    });

    // Delete a toy by ID
    app.delete("/api/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await TodoCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensure to close the client when done
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
