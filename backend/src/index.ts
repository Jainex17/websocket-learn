import express from 'express';
import { WebSocketServer } from 'ws';  
import { createServer } from 'http';

const app = express();
const server =  createServer(app);
const wss = new WebSocketServer({server});

interface User {
  roomid: string;
  username: string;
  ws: any;
}

const users: User[] = [];
let usercount = 0;

wss.on("connection", (ws, req) => {
  console.log("successfully connected" + usercount);
  const wsId = usercount++;
  
  ws.on("message", (msg: string)=> {
    const data = JSON.parse(msg.toString());

    if(data.type == "join") {
      users[wsId] = {
        roomid: data.roomid,
        username: data.username,
        ws
      }

      users.forEach(usr => {
        if(usr.roomid == data.roomid) {
          usr.ws.send(JSON.stringify({
            type: "join-message",
            username: data.username
          }));
        }
      })
    }

    if(data.type == "chat") {
      const roomid = data.roomid;
      const message = data.message;
      const username = data.username;
      
      users.forEach(usr => {
        if(usr.roomid === roomid) {
          usr.ws.send(JSON.stringify({
            type: "chat",
            username: username,
            message: message
          }));
        }
      })
    }    
  })
})

server.listen(3000, ()=>{
  console.log("connected");
});
