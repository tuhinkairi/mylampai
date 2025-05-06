// helpers/uploadHelpers.ts
import { BlockBlobClient } from "@azure/storage-blob";


export class Semaphore {
    private tasks: (() => void)[] = [];
    private counter: number;
  
    constructor(max: number) {
      this.counter = max;
    }
  
    async acquire() {
      if (this.counter > 0) {
        this.counter--;
        return;
      }
      await new Promise<void>(resolve => this.tasks.push(resolve));
      this.counter--;
    }
  
    release() {
      this.counter++;
      const next = this.tasks.shift();
      if (next) next();
    }
  }
  
  export const uploadSemaphore = new Semaphore(3); // tune parallelism here (3–5)
  
  // retry logic for stageBlock
  export const stageWithRetry = async (
    client: BlockBlobClient,
    blockId: string,
    buffer: ArrayBuffer
  ) => {
    const maxTries = 3;
    for (let attempt = 1; attempt <= maxTries; attempt++) {
      try {
        await client.stageBlock(blockId, buffer, buffer.byteLength);
        return; 
      } catch (err) {
        console.warn(`stageBlock attempt ${attempt} failed for ${blockId}`, err);
        if (attempt === maxTries) throw err;
        // backoff
        await new Promise(res => setTimeout(res, 1000 * attempt));
      }
    }
  };
  