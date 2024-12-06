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
  const watchListCollection = client
    .db("joyStick-journalsDB")
    .collection("watchList");

  try {
    // watchList api
    // app.put("/watchList/:email", async (req, res) => {
    //   let user = false;
    //   const email = req.params.email.trim().toLowerCase();
    //   const data = req.body;
    //   const filter = { email: email };
    //   const option = { upsert: true };
    //   const userExist = await watchListCollection.findOne(filter);
    //   user = userExist?._id ? true : false;
    //   if (!userExist) {
    //     const result = await watchListCollection.insertOne(data);

    //     user = result.acknowledged ? true : false;
    //   }
    //   if (user) {
    //     const existingIds = userExist?.ids ? userExist.ids : [];
    //     const { id: clientID } = data;
    //     existingIds.push(clientID);
    //     const finalUpdatedDoc = {
    //       $set: { ids: existingIds },
    //     };
    //     const finalResult = await watchListCollection.updateOne(
    //       filter,
    //       finalUpdatedDoc
    //     );
    //     res.send(finalResult);
    //   }
    // });
    app.put("/watchList/:email", async (req, res) => {
      const email = req.params.email.trim().toLowerCase();
      const data = req.body;

      if (!email || !data.id) {
        return res.status(400).send({ error: "Invalid email or id" });
      }

      const filter = { email: email };
      const userExist = await watchListCollection.findOne(filter);

      if (!userExist) {
        const newUser = { email, ids: [data.id] };
        const result = await watchListCollection.insertOne(newUser);
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
            return res.send({ message: "ID added to watchlist!" });
          }
        }
        return res.send({ message: "ID already exists in watchlist!" });
      }
    });

    // reviews api
    app.get("/reviews", async (req, res) => {
      const query = {};
      const result = await reviewsCollection.find(query).toArray();
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
