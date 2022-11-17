const http = require('http');

const dotEnv = require('dotenv');
const express = require('express');
const { Server } = require('socket.io');
const { Socket } = require('dgram');
const app = express();

dotEnv.config({ path: "./config/.env" })
app.use(express.static("./public"));

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`app is connected on port: ${PORT}`);
})

const onlineUsers = {};
io.on("connection", (socket) => {
    socket.on("login", data => {
        console.log(`User ${data.nickname} is connected`)
        socket.join(data.room);
        onlineUsers[socket.id] = {
            nickname: data.nickname,
            room: data.room
        };
        io.sockets.emit("online", onlineUsers);
    })
    socket.on("disconnect", () => {
        console.log(`User ${socket.id} is disConnect`)
        delete onlineUsers[socket.id];
        io.sockets.emit("online", onlineUsers)
    });
    socket.on("chat message", data => {
        io.to(data.room).emit("chat message", data);
    })
    socket.on("typing", data => {
        socket.broadcast.in(data.room).emit("typing", data);
    })
    socket.on("send message", data => {
        io.to(data.to).emit("pvChat", data);
    })


})