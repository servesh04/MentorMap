export interface LanguageTemplate {
    id: string;
    name: string;
    boilerplate: string;
    monacoLanguage: string;
}

export const SANDBOX_TEMPLATES: Record<string, LanguageTemplate> = {
    javascript: {
        id: 'javascript',
        name: 'JavaScript (Node.js)',
        monacoLanguage: 'javascript',
        boilerplate: `// JavaScript Coding Sandbox
// Write your single-file JavaScript code here...

function evaluatePrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

const testNumber = 29;
console.log(\`Is \${testNumber} a prime number? \${evaluatePrime(testNumber)}\`);
`
    },
    typescript: {
        id: 'typescript',
        name: 'TypeScript',
        monacoLanguage: 'typescript',
        boilerplate: `// TypeScript Coding Sandbox
// Write your single-file TypeScript code here...

interface LearningModule {
    id: string;
    title: string;
    duration: string;
    completed: boolean;
}

class ModuleTracker {
    private modules: LearningModule[] = [];

    addModule(mod: LearningModule): void {
        this.modules.push(mod);
        console.log(\`Added module: \${mod.title}\`);
    }

    listCompleted(): string[] {
        return this.modules
            .filter(m => m.completed)
            .map(m => m.title);
    }
}

const tracker = new ModuleTracker();
tracker.addModule({ id: "m1", title: "React Basics", duration: "10 mins", completed: true });
tracker.addModule({ id: "m2", title: "WebGPU Mechanics", duration: "25 mins", completed: false });

console.log("Completed Modules:", tracker.listCompleted());
`
    }
};
