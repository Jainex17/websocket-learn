import { useEffect, useRef, useState } from "react";

interface MsgType {
  username: string;
  message: string;
}

function App() {
  const [msg, setMsg] = useState("");
  const [roomId, setRoomId] = useState("");
  const [username, setUserName] = useState("");
  const [allMsg, setAllMsg] = useState<MsgType[]>([]);

  const ws = useRef<WebSocket>(null);

  useEffect(() => {
    const url = `${import.meta.env.VITE_IS_DEVELOPMENT ? "ws" : "wss"}://${import.meta.env.VITE_BACKEND_WS_URL}`;
    ws.current = new WebSocket(url);
  }, []);

  useEffect(() => {
    if (!ws.current) return;

    ws.current.onmessage = function (e) {
      const data = JSON.parse(e.data);
    console.log(data);
          
      if(data.type === "chat") {
        setAllMsg((prev) => [...prev, {
          message: data.message,
          username: data.username
        }]);
      }

      if(data.type === "join-message") {
        setAllMsg((prev) => [...prev, {
          message: data.username + " join the room",
          username: "system"
        }])
      }
    };
  }, [ws.current]);

  function handleSend() {
    if (!ws.current) return;

    ws.current.send(
      JSON.stringify({
        type: "chat",
        roomid: roomId,
        username: username,
        message: msg,
      })
    );
  }

  function handlejoin(e: any) {
    e.preventDefault();

    const username = e.target[0].value;
    const rid = e.target[1].value;
    setRoomId(rid);
    setUserName(username);

    ws.current?.send(JSON.stringify({
      type: "join",
      roomid: rid,
      username
    }))
  }

  return (
    <>
      <h1>WanaTalk?</h1>

      {roomId == "" ? (
        <>
          <form onSubmit={handlejoin}>
          <input type="text" placeholder="your name" /> <br />
          <input type="number" placeholder="roomid" /> <br />
          <button type="submit">join</button>
          </form>
        </>
      ) : (
        <>
          {" "}
          <div>
            <input
              type="text"
              placeholder="Message"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <button onClick={handleSend}>Send</button>
          </div>
          {allMsg.map((data, idx) => (
            <div key={idx} style={{ display: "flex", gap: "1px" }}>
              <p>{data.username != "system" && data.username + ":"}</p>
              <p>{data.message}</p>
            </div>
          ))}
        </>
      )}
    </>
  );
}

export default App;
