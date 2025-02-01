class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 1024;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferedSamples = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const inputChannel = input[0];
    
    // Add incoming samples to buffer
    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.bufferedSamples] = inputChannel[i];
      this.bufferedSamples++;

      // When buffer is full, send it to the main thread
      if (this.bufferedSamples >= this.bufferSize) {
        // Convert float32 to int16
        const int16Buffer = new Int16Array(this.bufferSize);
        for (let j = 0; j < this.bufferSize; j++) {
          int16Buffer[j] = Math.max(-32768, Math.min(32767, this.buffer[j] * 32768));
        }

        this.port.postMessage({
          audioData: int16Buffer.buffer
        }, [int16Buffer.buffer]);

        this.bufferedSamples = 0;
      }
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);