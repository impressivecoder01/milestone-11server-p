const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


app.use(cors())
app.use(express())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h77hn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // work related apis
    const jobsCollections = client.db('milestone-11(p)').collection('works')
    const jobsApplicationCollection = client.db('milestone-11(p)').collection('job_application')

    app.get('/works' , async(req, res)=> {
        const cursor = jobsCollections.find();
        const result = await cursor.toArray();
        res.send(result);
    })


    // get job details data by id
    app.get('/works/:id', async (req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await jobsCollections.findOne(query)
      res.send(result)
    })


    // job application apis
    app.post('/jobs_application', async(req, res) => {
      const application = req.body;
      const result = await jobsApplicationCollection.insertOne(application)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req, res)=>{
    res.send('JOB IS LOADING IN SHAA ALLAH')
})

app.listen(port, ()=>{
    console.log(`big jobs:${port}`)
})