"use client";
import { WebSocketProvider } from "@/hooks/interviewersocket/webSocketContext";

export default function NewInterviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <WebSocketProvider>{children}</WebSocketProvider>;
}
