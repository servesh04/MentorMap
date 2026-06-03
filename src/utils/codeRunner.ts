export interface LogMessage {
    type: 'log' | 'warn' | 'error';
    text: string;
}

export interface RunResult {
    logs: LogMessage[];
    success: boolean;
}

/**
 * Executes JS or TS code in an isolated client-side sandbox.
 * Transpiles TypeScript using Monaco's background workers.
 * Delegates evaluation to a sandboxed Web Worker with a 4s watchdog.
 */
export const executeClientCode = async (
    editorInstance: any,
    monacoInstance: any,
    language: string
): Promise<RunResult> => {
    if (!editorInstance) {
        return {
            logs: [{ type: 'error', text: 'Editor is not initialized.' }],
            success: false
        };
    }

    const rawCode = editorInstance.getValue();
    let runnableCode = rawCode;

    // Transpile TypeScript if needed
    if (language === 'typescript') {
        try {
            const model = editorInstance.getModel();
            if (!model) {
                throw new Error("No active editor model found.");
            }
            if (!monacoInstance) {
                throw new Error("Monaco editor namespace is missing.");
            }
            
            // Get worker and compile model
            const worker = await monacoInstance.languages.typescript.getTypeScriptWorker();
            const client = await worker(model.uri);
            const emitResult = await client.getEmitOutput(model.uri.toString());
            
            if (emitResult && emitResult.outputFiles && emitResult.outputFiles.length > 0) {
                runnableCode = emitResult.outputFiles[0].text;
            } else {
                throw new Error("Compilation yielded no outputs.");
            }
        } catch (err: any) {
            return {
                logs: [
                    { type: 'error', text: `Compilation Error: ${err.message || err}` }
                ],
                success: false
            };
        }
    }

    return new Promise<RunResult>((resolve) => {
        let worker: Worker;
        try {
            worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' });
        } catch (e: any) {
            resolve({
                logs: [{ type: 'error', text: `Failed to spawn Web Worker thread: ${e.message || e}` }],
                success: false
            });
            return;
        }

        const EXECUTION_TIMEOUT_MS = 4000;
        const watchdog = setTimeout(() => {
            worker.terminate();
            resolve({
                logs: [{ type: 'error', text: '❌ Time Limit Exceeded (TLE): Potential Infinite Loop detected!' }],
                success: false
            });
        }, EXECUTION_TIMEOUT_MS);

        worker.onmessage = (event) => {
            clearTimeout(watchdog);
            worker.terminate();
            const { success, logs, errorText } = event.data;
            if (success) {
                resolve({ logs, success: true });
            } else {
                const updatedLogs = [...logs];
                if (errorText) {
                    updatedLogs.push({ type: 'error', text: errorText });
                }
                resolve({ logs: updatedLogs, success: false });
            }
        };

        worker.onerror = (errorEvent) => {
            clearTimeout(watchdog);
            worker.terminate();
            resolve({
                logs: [{ type: 'error', text: `Web Worker Runtime Error: ${errorEvent.message || 'Unknown thread exception'}` }],
                success: false
            });
        };

        worker.postMessage({ code: runnableCode });
    });
};
