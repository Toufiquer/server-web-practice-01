const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());

app.use(cors());
app.use(express.json());
require("dotenv").config();

// Start MongoDB Server
const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.s4qhraf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Establish and verify connection
    const allProductsCollection = await client
      .db("allProductsCollection")
      .collection("allProducts");

    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const cursor = await allProductsCollection.insertOne(product);
      res.send({ cursor });
    });

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = await allProductsCollection.find(query);
      // print a message if no documents were found
      if ((await cursor.count()) === 0) {
        console.log("No documents found!");
      }
      // replace console.dir with your callback to access individual elements
      const result = await cursor.toArray();
      res.send({ cursor, result });
    });

    app.get("/product/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const cursor = await allProductsCollection.findOne(query);
      res.send({ cursor });
    });

    app.put("/updateProduct", async (req, res) => {
      const product = req.body;
      const query = { _id: new ObjectId(product.data._id) };
      delete product.data._id;

      console.log(query, product.data, " => Line No: 61");
      const updateDoc = {
        $set: {
          data: product.data,
        },
      };
      const options = { upsert: true };
      const cursor = await allProductsCollection.updateOne(
        query,
        updateDoc,
        options
      );
      // let cursor = "od";
      console.log(cursor, " => Line No: 69");
      res.send({ cursor });
    });

    app.delete("/removeProduct", async (req, res) => {
      const { productId } = req.body;
      const query = { _id: new ObjectId(productId) };

      const cursor = await allProductsCollection.deleteOne(query);
      if (cursor.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
      res.send({ cursor });
    });

    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
// End MongoDB Server

app.get("/", (req, res) => {
  res.send({ massage: "Node server is running It is Update..." });
});

app.listen(port, () => {
  console.log("Node server listening on port");
});
