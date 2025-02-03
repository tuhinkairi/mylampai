
"use client"
import React, { createContext, useContext, ReactNode } from "react";
import useWebSocket from "./useWebSocket";

interface WebSocketContextType {
    ws: WebSocket | null;
    connectWebSocket: () => WebSocket;
    disconnectWebSocket: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const { ws, connectWebSocket, disconnectWebSocket } = useWebSocket();

    return (
        <WebSocketContext.Provider value={{ ws, connectWebSocket, disconnectWebSocket }}>
            {children}
        </WebSocketContext.Provider>
    );
};

// ### 

// "use client"
// import React, { createContext, useContext, ReactNode } from "react";
// import useWebSocket from "./useWebSocket";

// interface WebSocketContextType {
//     ws: WebSocket | null;
// }

// const WebSocketContext = createContext<WebSocketContextType | null>(null);

// export const useWebSocketContext = (): WebSocketContextType => {
//     const context = useContext(WebSocketContext);
//     if (!context) {
//         throw new Error('useWebSocketContext must be used within a WebSocketProvider');
//     }
//     return context;
// };

// interface WebSocketProviderProps {
//     children: ReactNode;
// }

// export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
//     const ws = useWebSocket();

//     return (
//         <WebSocketContext.Provider value={ws} >
//             {children}
//         </WebSocketContext.Provider>
//     );
// };