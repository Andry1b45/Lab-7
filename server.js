const express = require('express');
const http = require('http');

const users = [];
const app = express();
const server = http.Server(app);
const port = process.env.PORT || 3000;
const io = require('socket.io')(server);
const db = require('./db.js');
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/db', (req, res) => {   
  db.all('SELECT * FROM messages', (err, rows) => {
  res.send(rows)
})});

app.get('/users', (req, res) => {
  res.send(users.join(','));
})

app.use(express.static('./client'));

io.on('connection', (socket) => {
  socket.on('set username', (username) => {
    users.push(username)
    socket.username = username;
    socket.broadcast.emit('system new', socket.username);
  })
  socket.on('message', (message) => {
    const data = {
      username: socket.username,
      message
    }
    db.run(`INSERT INTO messages VALUES (NULL, '${socket.username}', '${message} \n')`)
    io.emit('render message', data)
  })
  socket.on('disconnect', () => {
    users.splice(users.indexOf(socket.username), 1)
  })
})

server.listen(port, () => {
  console.log('listening on *:' + port);
});