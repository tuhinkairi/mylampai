export class TranscriptionWebSocket {
    private socket: WebSocket | null = null;
  
    constructor(private serverUrl: string) {}
  
    connect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
      this.socket = new WebSocket(this.serverUrl);
  
      this.socket.onopen = () => {
        console.log('WebSocket connection established.');
      };
  
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };
  
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };
  
      this.socket.onclose = () => {
        console.log('WebSocket connection closed.');
      };
    }
  
    send(data: any) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(data));
      } else {
        console.warn('WebSocket is not open. Unable to send message.');
      }
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    }
  }
  