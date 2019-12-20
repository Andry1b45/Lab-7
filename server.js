const express = require("express");
const http = require("http");
const app = express();
const server = http.Server(app);
const port = process.env.PORT || 3000;
const io = require("socket.io")(server);
const db = require("./db.js");
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

app.get("/db", (req, res) => { 
  db.all("SELECT * FROM messages", (err, rows) => { 
    res.send(rows); 
  });
});

app.use(express.static("./client")); //подгрузка всех файлов папки клиента

io.on("connection", socket => {
  socket.on("set username", username => {
    socket.username = username; 
    socket.broadcast.emit("system new", socket.username); 
  });
  socket.on("message", message => {
    const data = {
      username: socket.username,
      message
    };
    db.run( 
      `INSERT INTO messages VALUES (NULL, '${socket.username}', '${message} \n')`
    );
    io.emit("render message", data); 
  });
});

server.listen(port, () => {
  console.log("listening on *:" + port);
});
