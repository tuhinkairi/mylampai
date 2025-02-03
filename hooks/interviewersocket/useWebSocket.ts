import { useCallback, useEffect, useState } from 'react';
import { json } from 'stream/consumers';

// const url = "wss://ai-interviewer-c476.onrender.com/ws"
// const url = "wss://ai-interview-dzawedctafcceya3.centralindia-01.azurewebsites.net/ws"
const url = "ws://localhost:5000/ws/speech"

const useWebSocket = () => {
    const [ws, setWs] = useState<WebSocket | null>(null);

    // useEffect(() => {
    //     const socket = new WebSocket(url);

    //     socket.onopen = () => {
    //         ws?.send(JSON.stringify({ type: "HELLO" }));
    //         console.log('WebSocket connected');
    //     };

    //     socket.onerror = (error) => {
    //         console.log("Error conecting socket: ", error)
    //     };

    //     socket.onclose = () => {
    //         console.log('WebSocket closed');
    //     };

    //     setWs(socket);

    //     return () => {
    //         socket.close();
    //     };
    // }, []);

    // return { ws };

    const connectWebSocket = useCallback(() => {
        const socket = new WebSocket(url);
    
        socket.onopen = () => {
          socket.send(JSON.stringify({ type: "HELLO" }));
          console.log('WebSocket connected');
        };
    
        socket.onerror = (error) => {
          console.log("Error connecting socket: ", error);
        };
    
        socket.onclose = () => {
          console.log('WebSocket closed');
        };
    
        setWs(socket);
        return socket;
      }, []);
    
      const disconnectWebSocket = useCallback(() => {
        if (ws) {
          ws.close();
          setWs(null);
        }
      }, [ws]);
    
      return { 
        ws, 
        connectWebSocket, 
        disconnectWebSocket 
      };
};

export default useWebSocket;
