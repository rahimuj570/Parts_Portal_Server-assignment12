const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectID } = require("bson");
require("dotenv").config();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const app = express();
const stripe = require("stripe")(process.env.STRIPESECRET);

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
    const userCollection = client.db("userData").collection("user");
    const userReviewCollection = client.db("userData").collection("review");
    const productCollection = client.db("productData").collection("product");
    const myProductCollection = client
      .db("productData")
      .collection("myProduct");

    // ========= Add USER =======
    app.put("/user", async (req, res) => {
      const { name, email, role } = req.body;
      const useData = {
        $set: {
          name,
          email,
          role,
        },
      };
      const query = { email: email };
      const options = { upsert: true };
      const result = await userCollection.updateOne(query, useData, options);
      res.send(result);
    });

    // ========= Update USER =======
    app.put("/update_user", async (req, res) => {
      const { name, email, role, edu, city, phone } = req.body;
      const useData = {
        $set: {
          name,
          email,
          role,
          edu,
          city,
          phone,
        },
      };
      const query = { email: email };
      const options = { upsert: true };
      const result = await userCollection.updateOne(query, useData, options);
      res.send(result);
    });

    // ========= Get All USER =======
    app.get("/user", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const user = await cursor.toArray();
      res.send(user);
    });

    // ========= Get Specific USER =======
    app.get("/user/:email", async (req, res) => {
      const email = req.params;
      const query = { email: email.email };
      const cursor = await userCollection.findOne(query);
      res.send(cursor);
    });

    // ========= Get All Products =======
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const user = await cursor.toArray();
      res.send(user);
    });

    // ========= Specific Product API =======
    app.get("/product/:id", async (req, res) => {
      const id = req.params;
      console.log(id);
      const query = { _id: ObjectID(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // ========= checkout Specific user specific Product API =======
    app.get("/my_product/:id", async (req, res) => {
      const id = req.params;
      // console.log(req.headers);
      const query = { _id: ObjectID(id) };
      const result = await myProductCollection.findOne(query);
      res.send(result);
    });

    // ========= Update Product API =======
    app.put("/product/:id", async (req, res) => {
      const { name, quantity, price, picture, minQuantity, about } = req.body;
      const newData = {
        $set: {
          name,
          quantity,
          price,
          picture,
          minQuantity,
          about,
        },
      };
      const id = req.params;
      const query = { _id: ObjectID(id) };
      const options = { upsert: true };
      const result = await productCollection.updateOne(query, newData, options);
      res.send(result);
    });

    // ========= Delete Product API =======
    app.delete("/delete_product/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: ObjectID(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // ========= Add Product API =======
    app.post("/add_products", async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data);
      res.send({ result });
    });

    // ========= Add Specific User Product API =======
    app.post("/add_my_products", async (req, res) => {
      const data = req.body;
      const result = await myProductCollection.insertOne(data);
      res.send({ result });
    });

    // ========= Get My Product API =======
    app.get("/myPd/:email", async (req, res) => {
      const { email } = req.params;
      const query = { email: email };
      const result = await myProductCollection.find(query).toArray();
      res.send(result);
    });

    // ========= Delete My Product API =======
    app.delete("/myPd/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: ObjectID(id) };
      const result = await myProductCollection.deleteOne(query);
      res.send(result);
    });

    // ========= Add My Reviews API =======
    app.post("/add_rev", async (req, res) => {
      const data = req.body;
      const result = await userReviewCollection.insertOne(data);
      res.send({ result });
    });

    // ========= Get My Reviews API =======
    app.get("/add_rev", async (req, res) => {
      const query = {};
      const cursor = userReviewCollection.find(query).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // ========= STRIPE PAYMENT INTENT API =======
    app.post("/create-payment-intent", async (req, res) => {
      const service = req.body;
      const price = service.totalPrice;
      const amount = price * 100;
      console.log(amount);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
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
