require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());

// const uri = `mongodb+srv://${process.env.key}:${process.env.pass}@cluster0.0zizn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri = "mongodb://localhost:27017/";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  const usersCollection = client.db("joyStick-journalsDB").collection("users");
  const reviewsCollection = client
    .db("joyStick-journalsDB")
    .collection("reviews");

  try {
    // reviews api
    app.get("/reviews", async (req, res) => {
      const query = {};
      const result = await reviewsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const reviewsData = req.body;
      console.log(reviewsData);
      const result = await reviewsCollection.insertOne(reviewsData);
      res.send(result);
    });

    //
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.findOne(query);
      res.send(result);
    });

    // users api
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const data = req.body;
      const filter = { email: email };
      const option = { upsert: true };
      const updatedDoc = {
        $set: data,
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      res.send(result);
    });

    // comment out must
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("JoyStick Journals Running On....");
});

app.listen(port, () => {
  console.log(`JoyStick Journals sever running on port : ${port} `);
});
