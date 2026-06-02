import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// Instantiate the handler to listen for WebWorkerMLCEngine commands
const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (msg: MessageEvent) => {
    handler.onmessage(msg);
};
