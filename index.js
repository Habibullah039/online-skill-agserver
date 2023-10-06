const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tupfoh2.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {serverApi: { version: ServerApiVersion.v1, strict: true,deprecationErrors: true,}});






function verifyJWT(req, res, next) {
  const authHeaders = req.headers.authorization;

  if (!authHeaders) {
    return res.status(401).send({ message: 'unauthorized access' });
  }

  const token = authHeaders.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' });
    }

    // console.log('decoded' , decoded) ;
    req.decoded = decoded;
    next();
  })



}









async function run() {



  try {

    // await client.connect();

    const myCourseCollection = client.db("online-skill").collection("myCourses");
    const userCollection = client.db("online-skill").collection("user");
    const orderCollection = client.db("online-skill").collection("orders");
    



    // ..................Auth...............

    app.post('/login', async (req, res) => {

      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: '1d'

      });

      res.send({ accessToken });

    })

    // ....................................

    app.get('/courses', async (req, res) => {
      const query = {};
      const cursor = myCourseCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);

    })
    

    app.get('/order', verifyJWT , async (req, res) => {
      

      const decodedEmail = req.decoded.email;
      const email = req.query.email;

      if (decodedEmail === email) {

        const query = { email: email };
        const cursor = orderCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);

      }

      else {
        return res.status(403).send({ message: 'forbidden access' });
      }


    })


    app.get('/courses/:id', async (req, res) => {

      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myCourseCollection.findOne(query);
      res.send(result);

    })









    app.post('/signup', async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);

    })




    app.post('/order', async (req, res) => {

      const order = req.body;
  
      const result = await orderCollection.insertOne(order);
      res.send(result)


    })



    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    })




    
    


  



  }

  finally {

  }
  

}

run().catch(console.dir);


app.get('/', (req, res) => {

  res.send('Welcome to Online Skill Program')
  
})
  
app.listen(port, () => {

  console.log(`Online Skill Program on port ${port}`)

})