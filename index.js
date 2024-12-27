const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h77hn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // work related apis
    const jobsCollections = client.db("milestone-11(p)").collection("works");
    const jobsApplicationCollection = client
      .db("milestone-11(p)")
      .collection("job_application");

    // auth related apis

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, "secret", { expiresIn: "1h" });
      res.send(token)
    });

    app.get("/works", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { hr_email: email };
      }
      const cursor = jobsCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get job details data by id
    app.get("/works/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollections.findOne(query);
      res.send(result);
    });

    // create jobs
    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobsCollections.insertOne(newJob);
      res.send(result);
    });

    // app.get ('/job-applications/:id') ==> gat a specific job application by id
    // very very important
    app.get("/job-applications/jobs/:job_id", async (req, res) => {
      const jobId = req.params.job_id;
      const query = { job_id: jobId };
      const result = await jobsApplicationCollection.find(query).toArray();
      res.send(result);
    });

    // job application apis
    app.post("/jobs_application", async (req, res) => {
      const application = req.body;
      const result = await jobsApplicationCollection.insertOne(application);

      // not the best way(best way is use aggregate)

      res.send(result);
    });

    // get some data by email
    app.get("/job_application", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      const result = await jobsApplicationCollection.find(query).toArray();
      for (const application of result) {
        console.log(application.job_id);
        const query1 = { _id: new ObjectId(application.job_id) };
        const job = await jobsCollections.findOne(query1);
        if (job) {
          application.title = job.title;
          application.company = job.company;
          application.company_logo = job.company_logo;
          application.location = job.location;
        }
      }
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("JOB IS LOADING IN SHAA ALLAH");
});

app.listen(port, () => {
  console.log(`big jobs:${port}`);
});
