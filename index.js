require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.key}:${process.env.pass}@cluster0.0zizn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = "mongodb://localhost:27017/";

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
  const watchListCollection = client
    .db("joyStick-journalsDB")
    .collection("watchList");

  try {
    // filter by id to watchList collection
    app.get("/watchList/:email", async (req, res) => {
      const email = req.params.email.trim().toLowerCase();
      const filter = { email };
      const result = await watchListCollection.findOne(filter);

      res.send(result === null ? { message: "No data found" } : result);
    });

    // update watchList
    app.put("/updateWatchList/:email", async (req, res) => {
      const data = req.body;
      const email = req.params.email;
      const filter = { email: email };
      const updatedDoc = { $set: data };
      const result = await watchListCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // watchList id add
    app.put("/watchList/:email", async (req, res) => {
      const email = req.params.email.trim().toLowerCase();
      const data = req.body;
      if (!email || !data.id) {
        return res.status(400).send({ error: "Invalid email or id" });
      }

      const filter = { email: email };
      const userExist = await watchListCollection.findOne(filter);
      // console.log(userExist);
      if (!userExist) {
        const newUser = {
          email,
          ids: [data.id],
          user: data.user,
          isComplete: data.isComplete,
        };
        const result = await watchListCollection.insertOne(newUser);
        return res.send({ message: "Game added to watchlist!" });
      } else {
        const existingIds = userExist.ids || [];
        if (!existingIds.includes(data.id)) {
          existingIds.push(data.id);
          const updatedDoc = { $set: { ids: existingIds } };
          const result = await watchListCollection.updateOne(
            filter,
            updatedDoc
          );
          if (result.modifiedCount > 0) {
            return res.send({ message: "Game added to watchlist!" });
          }
        }
        return res.send({ message: "Game already exists in watchlist!" });
      }
    });

    // reviews apis

    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      if (!id || typeof data !== "object") {
        res.send({ message: "Invalid id or object" });
      }
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: data,
      };
      const option = { upsert: false };
      const result = await reviewsCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      res.send(result);
    });

    app.delete("/reviews", async (req, res) => {
      const id = req.body.id;
      if (!id) {
        res.status(404).send("invalid id");
      }
      const filter = { _id: new ObjectId(id) };
      const result = await reviewsCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/reviews?", async (req, res) => {
      const { userEmail, arrayOfIds, rating, limit, sort, filter } = req.query;
      let query = {};
      let option = {};
      if (arrayOfIds) {
        const convertIds = arrayOfIds.split(",");
        const objectIds = convertIds.map((id) => new ObjectId(id));
        query = { _id: { $in: objectIds } };
      }
      if (userEmail) {
        query = { userEmail: userEmail };
      }

      if (rating && limit) {
        query = { rating: { $gt: "3" } };
        option = { limit: 6 };
      }
      // sort
      if (sort) {
        query = {};
        const shortOption = {};
        shortOption[sort] = 1;
        const result = await reviewsCollection
          .find(query)
          .sort(shortOption)
          .toArray();
        res.send(result);
        return;
      }
      // filter
      if (filter) {
        query = { genres: filter };
        option = {};
      }

      const result = await reviewsCollection.find(query, option).toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const reviewsData = req.body;
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
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
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
