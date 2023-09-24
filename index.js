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
    const TodoReportsCollection = client.db("api").collection("todosReports");
    // Create MongoDB collections for likes, comments, and shares
    const LikesCollection = client.db("api").collection("likes");
    const CommentsCollection = client.db("api").collection("comments");


    app.get("/api/todos", async (req, res) => {
      try {
        const cursor = TodoCollection.find().sort({ timestamp: -1 });
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).json({ error: "An error occurred while fetching todos." });
      }
    });
    

    // Get all todos reports
    app.get("/api/todosReports", async (req, res) => {
      const cursor = TodoReportsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add a new todo
    app.post("/api/todos", async (req, res) => {
      const addedTodo = req.body;
      const result = await TodoCollection.insertOne(addedTodo);
      res.send(result);
    });
    // Add a new todo report
    app.post("/api/todosReports", async (req, res) => {
      const addedTodo = req.body;
      const result = await TodoReportsCollection.insertOne(addedTodo);
      res.send(result);
    });

    // Get a specific todo by ID
    app.get("/api/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await TodoCollection.findOne(query);
      res.send(result);
    });
    // Get a specific todo report by ID
    app.get("/api/todosReports/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await TodoReportsCollection.findOne(query);
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

    // Add a new like to a todo item
    app.post("/api/todos/:id/likes", async (req, res) => {
      const todoId = req.params.id;
      const { userId, userName } = req.body; // Assuming you pass user ID and user name from the frontend
      try {
        const result = await LikesCollection.insertOne({
          todoId,
          userId,
          userName,
        });
        res.json(result);
      } catch (error) {
        console.error("Error adding like:", error);
        res.status(500).json({ error: "An error occurred while adding a like." });
      }
    });


    // Get the count of likes for a todo item
    app.get("/api/todos/:id/likes", async (req, res) => {
      const todoId = req.params.id;
      try {
        const likeCount = await LikesCollection.countDocuments({ todoId });
        res.json({ likeCount });
      } catch (error) {
        console.error("Error fetching like count:", error);
        res.status(500).json({ error: "An error occurred while fetching like count." });
      }
    });

    // Get the count of comments for a todo item
    // app.get("/api/todos/:id/comments", async (req, res) => {
    //   const todoId = req.params.id;
    //   try {
    //     const commentCount = await CommentsCollection.countDocuments({ todoId });
    //     res.json({ commentCount });
    //   } catch (error) {
    //     console.error("Error fetching comment count:", error);
    //     res.status(500).json({ error: "An error occurred while fetching comment count." });
    //   }
    // });

    // Get comments for a specific todo item by todo ID
    app.get("/api/todos/:id/comments", async (req, res) => {
      const todoId = req.params.id;
      try {
        const query = { todoId };
        const comments = await CommentsCollection.find(query).toArray();
        res.json(comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "An error occurred while fetching comments." });
      }
    });

    // Get a specific comment by its ID
    app.get("/api/comments/:commentId", async (req, res) => {
      const commentId = req.params.commentId;
      try {
        const query = { _id: new ObjectId(commentId) };
        const comment = await CommentsCollection.findOne(query);
        res.json(comment);
      } catch (error) {
        console.error("Error fetching comment:", error);
        res.status(500).json({ error: "An error occurred while fetching the comment." });
      }
    });

    // Add a new comment to a todo item
    app.post("/api/todos/:id/comments", async (req, res) => {
      const todoId = req.params.id;
      const { userId, userName, text, photoURL, email, timestamp } = req.body; // Assuming you pass user ID, user name, and comment text from the frontend
      try {
        const result = await CommentsCollection.insertOne({
          todoId,
          userId,
          userName,
          text,
          photoURL,
          email,
          timestamp
        });
        res.json(result);
      } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "An error occurred while adding a comment." });
      }
    });

    // Delete a specific comment by its ID
    app.delete("/api/comments/:commentId", async (req, res) => {
      const commentId = req.params.commentId;
      try {
        const query = { _id: new ObjectId(commentId) };
        const result = await CommentsCollection.deleteOne(query);
        res.json(result);
      } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "An error occurred while deleting the comment." });
      }
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
