import { PIIMasker } from '../src/utils/piiMasker';

function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function runTests() {
    console.log("Running PII Masking and De-tokenization Unit Tests...");

    const masker = new PIIMasker();

    // Test Case 1: Email Masking
    const emailText = "Please contact me at john.doe@company.com or support@company.org.";
    const maskedEmail = masker.maskPrompt(emailText);
    console.log("Masked Email Text:", maskedEmail);
    assert(maskedEmail.includes("[EMAIL_1]") && maskedEmail.includes("[EMAIL_2]"), "Emails should be replaced with tokens");
    assert(!maskedEmail.includes("john.doe@company.com"), "Raw email 1 should not be present");
    assert(!maskedEmail.includes("support@company.org"), "Raw email 2 should not be present");

    // Test Case 2: Network Masking (IPv4 & IPv6)
    const netText = "The servers are located at 192.168.1.1 and 2001:0db8:85a3:0000:0000:8a2e:0370:7334.";
    const maskedNet = masker.maskPrompt(netText);
    console.log("Masked Net Text:", maskedNet);
    assert(maskedNet.includes("[NET_1]") && maskedNet.includes("[NET_2]"), "IP addresses should be replaced with tokens");
    assert(!maskedNet.includes("192.168.1.1"), "Raw IPv4 should not be present");
    assert(!maskedNet.includes("2001:0db8:85a3:0000:0000:8a2e:0370:7334"), "Raw IPv6 should not be present");

    // Test Case 3: Credentials Masking
    const credText = 'const config = {\n  password: "secret_passwd123",\n  client_secret: \'my-client-key-abc\'\n};';
    const maskedCred = masker.maskPrompt(credText);
    console.log("Masked Cred Text:", maskedCred);
    assert(maskedCred.includes('password: "[CREDENTIAL_1]"') || maskedCred.includes('password: \'[CREDENTIAL_1]\''), "Password should be replaced with credential token");
    assert(maskedCred.includes('client_secret: "[CREDENTIAL_2]"') || maskedCred.includes('client_secret: \'[CREDENTIAL_2]\''), "Client secret should be replaced with credential token");

    // Test Case 4: Tokens & API Keys Masking
    const tokenText = `Here is my openai key ${"sk-" + "1234567890abcdef1234567890abcdef1234567890abcdef"} and google key ${"AIza" + "Sy" + "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q"}.`;
    const maskedToken = masker.maskPrompt(tokenText);
    console.log("Masked Token Text:", maskedToken);
    assert(maskedToken.includes("[TOKEN_1]") && maskedToken.includes("[TOKEN_2]"), "API keys should be replaced with tokens");

    // Test Case 5: Detokenization (Reversal)
    const assistantResponse = "Hello! I received your configuration. Your password is [CREDENTIAL_1] and your server is [NET_1]. The email is [EMAIL_1].";
    const unmaskedResponse = masker.unmaskResponse(assistantResponse);
    console.log("Unmasked Response:", unmaskedResponse);
    assert(unmaskedResponse.includes("secret_passwd123"), "Password should be restored");
    assert(unmaskedResponse.includes("192.168.1.1"), "IP should be restored");
    assert(unmaskedResponse.includes("john.doe@company.com"), "Email should be restored");

    // Test Case 6: Safety Metrics Telemetry
    const metrics = masker.getSafetyMetrics();
    console.log("Metrics:", JSON.stringify(metrics, null, 2));
    assert(metrics.totalLeaksBlocked === 8, "Expected 8 total leaks blocked");
    assert(metrics.categories.emails === 2, "Expected 2 emails");
    assert(metrics.categories.networking === 2, "Expected 2 networking vectors");
    assert(metrics.categories.credentials === 2, "Expected 2 credentials");
    assert(metrics.categories.tokens === 2, "Expected 2 tokens");

    // Test Case 7: Reset Registry
    masker.clear();
    const metricsAfterClear = masker.getSafetyMetrics();
    assert(metricsAfterClear.totalLeaksBlocked === 0, "Metrics should be 0 after clear");
    const unmaskAfterClear = masker.unmaskResponse("My email is [EMAIL_1]");
    assert(unmaskAfterClear === "My email is [EMAIL_1]", "Should not unmask since registry is cleared");

    console.log("\nAll tests passed successfully!");
}

try {
    runTests();
} catch (error) {
    console.error("Test suite failed:", error);
    process.exit(1);
}
