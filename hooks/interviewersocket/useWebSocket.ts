import { useEffect, useState } from "react";

// Connection options interface
export interface WebSocketConnectionOptions {
  connectInterviewer?: boolean;
  connectRubrics?: boolean;
}

const interviewerServer = process.env
  .NEXT_PUBLIC_INTERVIEWER_API_ENDPOINT as string;
const rubricsServer = process.env.NEXT_PUBLIC_RUBRICS_API_ENDPOINT as string;

const useWebSocket = (options: WebSocketConnectionOptions = { 
  connectInterviewer: false, 
  connectRubrics: false 
}) => {
  const [interviewerWs, setInterviewerWs] = useState<WebSocket | null>(null);
  const [rubricsWs, setRubricsWs] = useState<WebSocket | null>(null);

  // Setup interviewer WebSocket
  useEffect(() => {
    if (!options.connectInterviewer) return;
    
    const interviewerSocket = new WebSocket(interviewerServer);
    
    interviewerSocket.onopen = () => {
      interviewerSocket.send(JSON.stringify({ type: "HELLO_INTERVIEWER" }));
      console.log("Interviewer WebSocket connected");
    };
    
    interviewerSocket.onerror = (error) => {
      console.error("Error connecting interviewer WebSocket: ", error);
    };
    
    interviewerSocket.onclose = () => {
      console.log("Interviewer WebSocket closed");
    };
    
    setInterviewerWs(interviewerSocket);
    
    return () => {
      interviewerSocket.close();
    };
  }, [options.connectInterviewer]);

  // Setup rubrics WebSocket
  useEffect(() => {
    if (!options.connectRubrics) return;
    
    const rubricsSocket = new WebSocket(rubricsServer);
    
    rubricsSocket.onopen = () => {
      rubricsSocket.send(JSON.stringify({ type: "HELLO_RUBRICS" }));
      console.log("Rubrics WebSocket connected");
    };
    
    rubricsSocket.onerror = (error) => {
      console.error("Error connecting rubrics WebSocket: ", error);
    };
    
    rubricsSocket.onclose = () => {
      console.log("Rubrics WebSocket closed");
    };
    
    setRubricsWs(rubricsSocket);
    
    return () => {
      rubricsSocket.close();
    };
  }, [options.connectRubrics]);

  return { interviewerWs, rubricsWs };
};

export default useWebSocket;