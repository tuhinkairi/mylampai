let mediaStream: MediaStream | null = null;

export const MediaService = {
  async initializeStream() {
    if (!mediaStream) {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      });
    }
    return mediaStream;
  },

  getStream() {
    return mediaStream;
  },

  releaseStream() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
  }
};
