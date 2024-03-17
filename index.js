require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const connectDB = require('./db/connect');
const UserModel = require('./model/user')

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', async function(req, res) {
  const username = req.body.username
  if(!username) {
    console.log('Please provide username')
  }

  await UserModel.create({username}).then((doc) => {
    res.json({username : doc.username, _id: doc._id })
  }).catch((err) => {
   return res.json({error: err.message})
  })
})

app.get('/api/users', async function(req, res){
  await UserModel.find({}).then((doc) => {
    res.json({users: doc})
  }).catch((err) => {
    return res.json({error: err})
  })
})


app.post('/api/users/:_id/exercises', async function(req, res){
  const _id = req.params._id

  const { description, duration, date} = req.body

  const usedDate = date ? new Date(date).toString() :  new Date()

  if(usedDate?.toString() === 'Invalid Date') {
    res.json({error: 'Invalid date'})
  }
  await UserModel.findByIdAndUpdate({_id}, {
    description,
    duration,
    date: usedDate

  }, {new: true}).then((doc) => {
    res.json({user: doc})
  }).catch((err) => {
    return res.json({error: err})
  })
 

})


app.get('/api/users/:_id/logs', async function(req, res){
  const _id = req.params._id
  const limit = req.query.limit || 2

  const result = await UserModel.find({_id}).limit(limit)

  if(!result) {
    return res.json({error: 'User not found'})
  }

  const data = result.map((item) => {
    return {
      _id: item._id,
      username: item.username,
      description: item.description,
      duration: Number(item.duration),
      date: new Date(item.date).toDateString()
    }
  })
  res.json({user: data})
})


const port = process.env.PORT || 8000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
