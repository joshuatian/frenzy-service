const express = require('express'); 
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const db = require('./db/connection');
const Info = db.get('Info');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

const PORT = process.env.PORT || 5000; 
http.listen(PORT, function(){
console.log('listening on port: ' + PORT);
    io.on('connection', function(socket){
    console.log("New client: " + socket.id);
    socket.on('newSeller', function(message){
        socket.broadcast.emit('newSeller', message);
        });
    });
});

app.get('/', (req, res) =>{
    res.json({
        message: 'home'
    });
});

app.get('/info', (req, res) => {
    Info
    .find()
    .then(Info =>{
        res.json(Info);
    });
});

app.post('/info', (req, res) => {
    if(valid(req.body)){
        var utcStart = Date.now();
        var utcFinish = new Date(Date.now() + req.body.duration*60*60*1000 + 60*1000);
        var start = splitTime(utcStart);
        var finish = splitTime(utcFinish);
        const info = {
            start: start,
            finish: finish,
            utcEnd: utcFinish,
            IGN: req.body.name.toString(),
            map: req.body.map.toString(),
            Duration: req.body.duration,
            ch: req.body.channel,
        }
    Info
        .insert(info)
        .then(newInfo => {
            res.json(newInfo);
        });
    } else {
        res.status(422);
        res.json({
            message: 'Please fill in the form!'
        });
    }
});

function valid(info) {
    return info.name && info.name.toString().trim() !== "" &&
    info.map && info.map.toString().trim() !== ""
}

function splitTime(time){
    var seconds = Math.floor((time/1000) % 60);
    var minutes = ((time/1000/60) % 60);
    var hours = ((time/1000/60/60) % 24);
    var finished = Math.floor(hours) - 5 + ':' + Math.floor(minutes) + ':' + Math.floor(seconds);
    return finished;
}

