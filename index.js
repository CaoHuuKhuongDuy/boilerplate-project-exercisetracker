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
function query(s){
  return typeof s != "undefined"
}
function get_date(s)
{
  if (!query(s) || s == "") return new Date();
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
    date : get_date(req.body.date)
  }
  new_excercise.date.setMilliseconds(0)
  new_excercise.date = new_excercise.date.getTime()
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

let err_record = []

app.get('/api/users/:_id/logs',function (req,res){
  let from = query(req.query.from) ? new Date(req.query.from) : -1;
  let to = query(req.query.to) ? new Date(req.query.to) : -1;
  let limit = query(req.query.limit) ? Number(req.query.limit) : -1;
  let id = ObjectId(req.params._id)
  if (from != -1 || to != -1)
    {
      if (from == -1) from = new Date(0);
      if (to == -1) to = new Date();
    }
  if (from != -1) 
    {
      from.setMilliseconds(0);
      from = from.getTime();
    }
  if (to != -1) 
    {
      to.setMilliseconds(0);
      to = to.getTime()
    }

  err_record.push({id,from,to,limit})
  function check (a){
    return ((from == -1 || a.date >= from) && (a.date <= to || to == -1));
  }
  user.findById(id,function (err,data){
    if (err) throw err;
    let result = {
      _id : req.params._id,
      username : data.username,
      count : 0,
      log : []
    }
    for (let i in data.exercises)
    {
      console.log(`${from} - ${to} : ${data.exercises[i].date}`)
      if (check(data.exercises[i])) 
        {
          if (Number(i) + 1 > limit && limit != -1) break;
          result.count ++;
          let tmp = JSON.parse(JSON.stringify(data.exercises[i]));
          tmp.date = get_date(tmp.date).toDateString()
          // delete tmp._id;
          result.log.push(tmp)
        }
      }
    res.send(result)
  })
})


// let result_log = []
// let cnt = 0
// app.get("/api/users/:_id/logs", (req, res) => {
//   user.findById(req.params._id).then((result) => {
//     let resObj = JSON.parse(JSON.stringify(result));
//     // let tmp = JSON.parse(JSON.stringify(data.exercises[i]));
//     if (req.query.from || req.query.to) {
//       let fromDate = new Date(0);
//       let toDate = new Date();

//       if (req.query.from) {
//         fromDate = new Date(req.query.from);
//       }
      
//       if (req.query.to) {
//         toDate = new Date(req.query.to);
//       }

//       fromDate = fromDate.getTime();
//       toDate = toDate.getTime();

//       resObj.exercises = resObj.exercises.filter((session) => {
//         let sessionDate = new Date(session.date).getTime();
//         return sessionDate >= fromDate && sessionDate <= toDate;
//       });
//        err_record.push([req.params._id,new Date(fromDate).toDateString(),new Date(toDate).toDateString(),req.query.limit])
//     }
//     else err_record.push([req.params._id,req.query.limit])
//     if (req.query.limit) {
//       resObj.exercises = resObj.exercises.slice(0, req.query.limit);
//     }
   
//     resObj["count"] = result.exercises.length;
//     resObj.log = resObj.exercises
//     delete resObj.exercises
//     for (let i = 0;i < resObj.log.length;i++)
//       resObj.log[i].date = new Date(resObj.log[i].date).toDateString()  
//     // console.log(resObj.exercises[0].date);
//     // console.log(resObj.log[0].date)
//     // console.log(resObj)
//     result_log.push(resObj)
//     res.json(resObj);
//   });
// });



app.get('/catch',function (req,res){
  let log = [err_record,result_log]
  res.send(log)
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
