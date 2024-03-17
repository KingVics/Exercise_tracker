require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const connectDB = require('./db/connect');
const UserModel = require('./model/user')
const ExerciseModel = require('./model/exercise')

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
    const users = doc.map((item) => {
      return {
        username: item.username,
        _id: item._id
      }
    })
    res.send([...users])
  }).catch((err) => {
    return res.json({error: err})
  })
})


app.post('/api/users/:_id/exercises', async function(req, res){
  const _id = req.params._id

  const { description, duration, date} = req.body

  const usedDate = date && date.length > 0 ? new Date(date).toString() :  new Date()

  if(usedDate?.toString() === 'Invalid Date') {
    res.json({error: 'Invalid date'})
  }
  await UserModel.findOne({_id}).then(async (doc) => {
   await ExerciseModel.create({
      userId: doc._id,
      date: new Date(usedDate).toDateString(),
      duration: duration,
      description:description
      
   }).then((exercise) => {
    res.json({
      _id: _id,
      username: doc.username,
      date:exercise.date,
      duration: exercise.duration,
      description: exercise.description
    })
   })
  }).catch((err) => {
    return res.json({error: err})
  })
 

})


app.get('/api/users/:_id/logs', async function(req, res){
  const _id = req.params._id
  const limit = req.query.limit || 2
  const from = req.query.from
  const to = req.query.to

  const result = await UserModel.findOne({_id})

  if(!result || !result._id) {
    return res.json({error: 'User not found'})
  }

  let queryObject = {userId: result._id}

  if(new Date(from).toString() && new Date(to).toString()) {
    queryObject.date = { $gte: new Date(from).toString(), $lte: new Date(to).toString() };
  }
  const allexercises  = await ExerciseModel.find(queryObject).limit(limit).select({description: 1, duration:1, date:1, _id: 0})

  const exercises = allexercises.length > 0 ? allexercises.map((item) => {
    return {
      description: item.description.toString(),
      duration: Number(item.duration),
      date: new Date(item.date).toDateString()
    }
  }) : []

  const user = {
    _id:result._id,
    username: result.username,
    count: exercises.length,
    log: exercises 
  }
  res.json(user)
})


const port = process.env.PORT || 3000

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
