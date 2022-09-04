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
  name : String,
  exercises : [{
  description : String,
  duration : Number,
  date: Number}]
})

let user = mongoose.model('user',UserSchema);

app.post('/api/users',function (req,res){
  let person = new user({name : req.body.username});
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
  let result = user.find().select('+name +_id').exec(function (err,data){
    if (err) throw err;
    res.send(data);
  });
})
function get_date(s)
{
  if (s == "") return new Date();
  return new Date(s);
}
app.post('/api/users/:_id/exercises',function (req,res){
  let new_excercise = {
    description : req.body.description,
    duration : req.body.description,
    date : get_date(req.body.date).getTime()
  }
  res.send(new_excercise);
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
