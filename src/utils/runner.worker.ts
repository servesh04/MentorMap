const ctx: Worker = self as any;

interface LogMessage {
    type: 'log' | 'warn' | 'error';
    text: string;
}

ctx.onmessage = (e: MessageEvent) => {
    const { code } = e.data;
    const logs: LogMessage[] = [];

    // Helper to format arguments similar to browser console
    const formatArgs = (args: any[]): string => {
        return args
            .map(arg => {
                if (arg === null) return 'null';
                if (arg === undefined) return 'undefined';
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch (e) {
                        return Object.prototype.toString.call(arg);
                    }
                }
                return String(arg);
            })
            .join(' ');
    };

    // Custom console implementation within the worker context
    const mockConsole = {
        log: (...args: any[]) => {
            logs.push({ type: 'log', text: formatArgs(args) });
        },
        warn: (...args: any[]) => {
            logs.push({ type: 'warn', text: formatArgs(args) });
        },
        error: (...args: any[]) => {
            logs.push({ type: 'error', text: formatArgs(args) });
        }
    };

    try {
        // Enclose code inside a scoped closure passing mockConsole as console
        const executionFn = new Function('console', code);
        executionFn(mockConsole);
        ctx.postMessage({ success: true, logs });
    } catch (err: any) {
        let errorText = '';
        if (err instanceof Error) {
            errorText = `${err.name}: ${err.message}`;
            if (err.stack) {
                // Strip worker engine internal frames from stack trace
                const stackLines = err.stack.split('\n').slice(1);
                const filteredStack = stackLines
                    .map(line => line.trim())
                    .filter(line => line.includes('<anonymous>') || line.includes('eval'))
                    .join('\n  ');
                if (filteredStack) {
                    errorText += `\n  at ${filteredStack}`;
                }
            }
        } else {
            errorText = String(err);
        }
        ctx.postMessage({ success: false, errorText, logs });
    }
};
