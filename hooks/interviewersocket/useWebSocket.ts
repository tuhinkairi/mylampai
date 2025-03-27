import { useEffect, useState } from "react";

const interviewerServer = process.env.NEXT_PUBLIC_INTERVIEWER_API_ENDPOINT as string;
const rubricsServer = process.env.NEXT_PUBLIC_RUBRICS_API_ENDPOINT as string;

const useWebSocket = () => {
    const [interviewerWs, setInterviewerWs] = useState<WebSocket | null>(null);
    const [rubricsWs, setRubricsWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const interviewerSocket = new WebSocket(interviewerServer);
        const rubricsSocket = new WebSocket(rubricsServer);

        interviewerSocket.onopen = () => {
            interviewerSocket.send(JSON.stringify({ type: "HELLO_INTERVIEWER" }));
            console.log("Interviewer WebSocket connected");
        };

        rubricsSocket.onopen = () => {
            rubricsSocket.send(JSON.stringify({ type: "HELLO_RUBRICS" }));
            console.log("Rubrics WebSocket connected");
        };

        interviewerSocket.onerror = (error) => {
            console.error("Error connecting interviewer WebSocket: ", error);
        };

        rubricsSocket.onerror = (error) => {
            console.error("Error connecting rubrics WebSocket: ", error);
        };

        interviewerSocket.onclose = () => {
            console.log("Interviewer WebSocket closed");
        };

        rubricsSocket.onclose = () => {
            console.log("Rubrics WebSocket closed");
        };

        setInterviewerWs(interviewerSocket);
        setRubricsWs(rubricsSocket);

        return () => {
            interviewerSocket.close();
            rubricsSocket.close();
        };
    }, []);

    return { interviewerWs, rubricsWs };
};

export default useWebSocket;
