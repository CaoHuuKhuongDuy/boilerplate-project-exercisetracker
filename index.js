const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()
let My_Uri = "mongodb+srv://CaoHuuKhuongDuy:21nhatranG@cluster0.hrxneeb.mongodb.net/fcc-mongodb-and-mongoose?retryWrites=true&w=majority"

mongoose.connect(My_Uri, { useNewUrlParser: true, useUnifiedTopology: true })
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let UserSchema = new mongoose.Schema({
  username : String,
  exercises : [{
  description : String,
  duration : Number,
  date: Number}]
})

let user = mongoose.model('user',UserSchema);

app.post('/api/users',function (req,res){
  let person = new user({username : req.body.username});
  person.save(function(err,data){
    if (err) throw err;
    let result = {
      username : req.body.username,
      _id : data._id.toString()
    }
    res.send(result);
  });
  
})
app.get('/api/users',function (req,res){
  let result = user.find().select('-exercises').exec(function (err,data){
    if (err) throw err;
    res.send(data);
  });
})
function get_date(s)
{
  if (s == "") return new Date();
  return new Date(s);
}
function ObjectId(s)
{
  return mongoose.Types.ObjectId(s);
}
app.post('/api/users/:_id/exercises',function (req,res){
  let new_excercise = {
    description : req.body.description,
    duration : Number(req.body.duration),
    date : get_date(req.body.date).getTime()
  }
  let id = ObjectId(req.params._id);
  user.findById(id,function (err,data){
    if (err) throw err;
    data.exercises.push(new_excercise)
    data.save(function (err,exer){
      if (err) throw err;
      
    })
    let result = {
      _id : req.params._id,
      username : data.username,
      date : new Date(new_excercise.date).toDateString(),
      duration : new_excercise.duration,
      description : new_excercise.description
    }
    res.send(result)
  })
})

app.get('/api/users/:_id/logs',function (req,res){
  function query(s){
    return typeof s != "undefined"
  }
  let from = query(req.query.from) ? new Date(req.query.from).getTime() : -1;
  let to = query(req.query.to) ? new Date(req.query.to).getTime() : -1;
  let limit = query(req.query.limit) ? Number(req.query.limit) : -1;
  let id = ObjectId(req.params._id)
  function check (a){
    if (from != -1 && from > a.date) return false;
    if (to != -1 && to < a.date) return false;
    if (limit != -1 && limit < a.duration) return false;
    return true;
  }
  user.findById(id,function (err,data){
    if (err) throw err;
    let result = {
      _id : req.params._id,
      username : data.username,
      count : 0,
      logs : []
    }
    for (let i in data.exercises)
      if (check(data.exercises[i])) 
        {
          result.count ++;
          let tmp = JSON.parse(JSON.stringify(data.exercises[i]));
          tmp.date = get_date(tmp.date).toDateString()
          delete tmp._id;
          result.logs.push(tmp)
        }
    res.send(result)
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
