"use client";

import React, { createContext, useContext, ReactNode } from "react";
import useWebSocket from "./useWebSocket";

interface WebSocketContextType {
    interviewerWs: WebSocket | null;
    rubricsWs: WebSocket | null;
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
    const { interviewerWs, rubricsWs } = useWebSocket();

    return (
        <WebSocketContext.Provider value={{ interviewerWs, rubricsWs }}>
            {children}
        </WebSocketContext.Provider>
    );
};