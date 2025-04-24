"use client";
import React, { createContext, useContext, ReactNode, useState } from "react";
import useWebSocket, { WebSocketConnectionOptions } from "./useWebSocket";

interface WebSocketContextType {
    interviewerWs: WebSocket | null;
    rubricsWs: WebSocket | null;
    connectInterviewer: () => void;
    connectRubrics: () => void;
    disconnectInterviewer: () => void;
    disconnectRubrics: () => void;
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
    initialOptions?: WebSocketConnectionOptions;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
    children, 
    initialOptions = { connectInterviewer: false, connectRubrics: false } 
}) => {
    const [connectionOptions, setConnectionOptions] = useState<WebSocketConnectionOptions>(initialOptions);
    const { interviewerWs, rubricsWs } = useWebSocket(connectionOptions);

    const connectInterviewer = () => {
        setConnectionOptions(prev => ({ ...prev, connectInterviewer: true }));
    };

    const connectRubrics = () => {
        setConnectionOptions(prev => ({ ...prev, connectRubrics: true }));
    };

    const disconnectInterviewer = () => {
        setConnectionOptions(prev => ({ ...prev, connectInterviewer: false }));
    };

    const disconnectRubrics = () => {
        setConnectionOptions(prev => ({ ...prev, connectRubrics: false }));
    };

    return (
        <WebSocketContext.Provider value={{ 
            interviewerWs, 
            rubricsWs,
            connectInterviewer,
            connectRubrics,
            disconnectInterviewer,
            disconnectRubrics
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};