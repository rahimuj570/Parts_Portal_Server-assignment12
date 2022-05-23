const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectID } = require("bson");
require("dotenv").config();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const app = express();

// ======== Middleware =========
app.use(cors());
app.use(express.json());

// ======== Connect DB ========
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.ac8d0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("productsData").collection("product");

    // ========= Add USER =======
    app.post("/user", async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data);
      res.send({ result });
    });

    //
  } finally {
  }
}
run().catch(console.dir);

// ========= Init API =======
app.get("/", async (req, res) => {
  res.send("API is Running");
});

// ========== Listening =======
app.listen(port, () => {
  console.log("Listening to port", port);
});

// ========= Verify Token =========
function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.TOKEN, function (err, decoded) {
    if (err) {
      email = "Unauthorized";
    }
    if (decoded) {
      email = decoded;
    }
  });
  return email;
}
