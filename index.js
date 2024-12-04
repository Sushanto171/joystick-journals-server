require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// JoySitck-journals
// LgAsJ5AMWoX90w6O
const key = process.env.key;
const pass = process.env.pass;
console.log({ key, pass });
const uri =
  "mongodb+srv://<db_username>:<db_password>@cluster0.0zizn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("JoyStick Journals Running On....");
});

app.listen(port, () => {
  console.log(`JoyStick Journals sever running on port : ${port} `);
});
