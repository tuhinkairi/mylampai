import { SpeechClient } from '@google-cloud/speech';
import WebSocket from 'ws';
import { createServer } from 'http';
const Microphone = require('node-microphone');

let wss;

export function POST(req, res) {
  // Start the WebSocket server on the backend
  const server = createServer((req, res) => {
    res.statusCode = 200;
    res.end('WebSocket server running');
  });

  wss = new WebSocket.Server({ server });

  // Handle new WebSocket connection
  wss.on('connection', (ws) => {
    console.log('Client connected via WebSocket');

    // Create a Google Cloud Speech client
    const client = new SpeechClient();
    const encoding = 'LINEAR16';
    const sampleRateHertz = 16000;
    const languageCode = 'en-US';

    const request = {
      config: {
        encoding,
        sampleRateHertz,
        languageCode,
      },
      interimResults: true, // Set this to false for final results only
    };

    const recognizeStream = client.streamingRecognize(request)
      .on('error', (err) => {
        console.error('Error in streaming recognition:', err);
      })
      .on('data', (data) => {
        if (data.results[0] && data.results[0].alternatives[0]) {
          const transcript = data.results[0].alternatives[0].transcript;
          ws.send(JSON.stringify({ transcript }));
        }
      });

    // Your logic to capture audio and send it to Google Cloud Speech API
    // Example: (using `node-microphone` or any other method)
    const mic = new Microphone();
    const micStream = mic.getAudioStream();

    micStream.pipe(recognizeStream); // Pipe mic data to Google API
    mic.startRecording();

    // Close WebSocket connection when done
    ws.on('close', () => {
      mic.stopRecording();
      console.log('Client disconnected');
    });

    // End WebSocket connection when POST request is complete
    req.on('end', () => {
      ws.close();
    });
  });

  // Start the WebSocket server
  server.listen(8080, () => {
    console.log('WebSocket server listening on ws://localhost:8080');
  });

  // Send the initial response back to the client
  res.status(200).send({ message: 'Listening for audio' });
}

