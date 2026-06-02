export class PIIMasker {
    private registry: Map<string, string>;
    private counters: Map<string, number>;
    private metrics: {
        totalLeaksBlocked: number;
        categories: {
            credentials: number;
            emails: number;
            networking: number;
            tokens: number;
        };
    };

    constructor() {
        this.registry = new Map<string, string>();
        this.counters = new Map<string, number>();
        this.metrics = {
            totalLeaksBlocked: 0,
            categories: {
                credentials: 0,
                emails: 0,
                networking: 0,
                tokens: 0,
            },
        };
    }

    /**
     * Retrieve or create a deterministic token for a given category and sensitive value.
     * Prevents duplicate tokens for identical values in the same execution context.
     */
    private getOrCreateToken(category: string, value: string): string {
        // Search if we already mapped this exact value to a token in the registry
        for (const [token, registeredValue] of this.registry.entries()) {
            if (registeredValue === value && token.startsWith(`[${category}_`)) {
                return token;
            }
        }

        // Increment count for this type
        const count = this.counters.get(category) || 0;
        const newCount = count + 1;
        this.counters.set(category, newCount);

        const token = `[${category}_${newCount}]`;
        this.registry.set(token, value);

        // Update telemetry metrics
        this.metrics.totalLeaksBlocked++;
        if (category === "CREDENTIAL") {
            this.metrics.categories.credentials++;
        } else if (category === "EMAIL") {
            this.metrics.categories.emails++;
        } else if (category === "NET") {
            this.metrics.categories.networking++;
        } else if (category === "TOKEN") {
            this.metrics.categories.tokens++;
        }

        return token;
    }

    /**
     * Scan and deterministic-mask any personal or corporate egress vectors from raw user text.
     */
    public maskPrompt(rawText: string): string {
        if (!rawText) return rawText;

        let maskedText = rawText;

        // 1. Scrub credentials/password assignments inside configuration/code syntaxes
        // Matches password = "value", password: "value", client_secret: 'value' etc.
        const credentialRegex = /(password|passwd|pwd|db_password|client_secret|client_key|api_secret|secret)\s*([:=]\s*)(["'])([^"'\n\r]+)(["'])/gi;
        maskedText = maskedText.replace(credentialRegex, (match, key, assign, quoteStart, secret, quoteEnd) => {
            // Avoid double masking already tokenized credentials
            if (secret.startsWith("[CREDENTIAL_")) return match;
            const token = this.getOrCreateToken("CREDENTIAL", secret);
            return `${key}${assign}${quoteStart}${token}${quoteEnd}`;
        });

        // 2. Scrub standard emails
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        maskedText = maskedText.replace(emailRegex, (match) => {
            if (match.startsWith("[EMAIL_")) return match;
            return this.getOrCreateToken("EMAIL", match);
        });

        // 3. Scrub networking vectors (IPv4 and IPv6)
        const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
        maskedText = maskedText.replace(ipv4Regex, (match) => {
            if (match.startsWith("[NET_")) return match;
            return this.getOrCreateToken("NET", match);
        });

        const ipv6Regex = /\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b/g;
        maskedText = maskedText.replace(ipv6Regex, (match) => {
            if (match.startsWith("[NET_")) return match;
            return this.getOrCreateToken("NET", match);
        });

        // 4. Scrub authentication keys, Google keys, OpenAI keys, Bearer headers, and JWTs
        const openAiKeyRegex = /\bsk-[A-Za-z0-9]{32,48}\b/g;
        maskedText = maskedText.replace(openAiKeyRegex, (match) => {
            if (match.startsWith("[TOKEN_")) return match;
            return this.getOrCreateToken("TOKEN", match);
        });

        const googleKeyRegex = /\bAIzaSy[A-Za-z0-9-_]{33}\b/g;
        maskedText = maskedText.replace(googleKeyRegex, (match) => {
            if (match.startsWith("[TOKEN_")) return match;
            return this.getOrCreateToken("TOKEN", match);
        });

        const bearerRegex = /\bbearer\s+([A-Za-z0-9\-._~+/]+=*)\b/gi;
        maskedText = maskedText.replace(bearerRegex, (match, secret) => {
            if (secret.startsWith("[TOKEN_")) return match;
            const token = this.getOrCreateToken("TOKEN", secret);
            return `Bearer ${token}`;
        });

        // JWT components separated by dots
        const jwtRegex = /\b([A-Za-z0-9-_=]+)\.([A-Za-z0-9-_=]+)\.([A-Za-z0-9-_.+/=]*)\b/g;
        maskedText = maskedText.replace(jwtRegex, (match) => {
            // Exclude small dotted strings that are clearly not JWTs (heuristic: JWT parts are typically longer)
            if (match.length < 40) return match;
            if (match.startsWith("[TOKEN_")) return match;
            return this.getOrCreateToken("TOKEN", match);
        });

        return maskedText;
    }

    /**
     * Detokenize masked responses coming from the cloud before rendering or persisting them.
     */
    public unmaskResponse(maskedText: string): string {
        if (!maskedText) return maskedText;

        let unmaskedText = maskedText;

        // Perform text replacements for all registered token values in memory
        for (const [token, rawValue] of this.registry.entries()) {
            // Escapes brackets in the token for safe RegEx replacement
            const safeToken = token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const tokenRegex = new RegExp(safeToken, 'g');
            unmaskedText = unmaskedText.replace(tokenRegex, rawValue);
        }

        return unmaskedText;
    }

    /**
     * Output non-sensitive compliance auditing telemetry metadata.
     */
    public getSafetyMetrics() {
        return { ...this.metrics };
    }

    /**
     * Reset the volatile memory registry and localized category counters.
     */
    public clear(): void {
        this.registry.clear();
        this.counters.clear();
        this.metrics.totalLeaksBlocked = 0;
        this.metrics.categories.credentials = 0;
        this.metrics.categories.emails = 0;
        this.metrics.categories.networking = 0;
        this.metrics.categories.tokens = 0;
    }
}
