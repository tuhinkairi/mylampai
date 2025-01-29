import { useEffect, useState } from 'react';
import { json } from 'stream/consumers';

// const url = "wss://ai-interviewer-c476.onrender.com/ws"
// const url = "wss://ai-interview-dzawedctafcceya3.centralindia-01.azurewebsites.net//ws"
const url = "ws://localhost:8000/ws"

const useWebSocket = () => {
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);

        socket.onopen = () => {
            ws?.send(JSON.stringify({ type: "HELLO" }));
            console.log('WebSocket connected');
        };

        socket.onerror = (error) => {
            console.log("Error conecting socket: ", error)
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, []);

    return { ws };
};

export default useWebSocket;
