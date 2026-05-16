import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import createGroqModel from '../services/groqService.js';

const SYSTEM_PROMPT = `You are a security engineer reviewing a Pull Request.
Analyze the provided code diff for security vulnerabilities only.

Check for:
- Hardcoded secrets, API keys, passwords, tokens
- SQL injection vulnerabilities
- Unvalidated or unsanitized user inputs
- Unsafe use of eval() or similar
- Exposed sensitive data in logs or responses
- Insecure direct object references
- Missing authentication or authorization checks

Respond in this exact format:

SEVERITY: [LOW | MEDIUM | HIGH | CRITICAL]
ISSUES FOUND: [number]

FINDINGS:
- [finding 1]
- [finding 2]
(list only real issues, skip if none)

SUGGESTION:
[one most critical fix to make immediately]

Be concise. Be specific. Reference the actual filename when possible.
If no security issues found, say so briefly and set ISSUES FOUND: 0.`;

const runSecurityAgent = async (diff) => {
  const start = Date.now();
  const model = createGroqModel(0.1);

  try {
    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(`Review this diff:\n\n${diff}`),
    ]);

    return {
      agent_name: 'security',
      output: response.content,
      input_tokens: response.usage_metadata?.input_tokens ?? null,
      output_tokens: response.usage_metadata?.output_tokens ?? null,
      execution_time_ms: Date.now() - start,
      status: 'success',
      error_message: null,
    };
  } catch (error) {
    return {
      agent_name: 'security',
      output: null,
      input_tokens: null,
      output_tokens: null,
      execution_time_ms: Date.now() - start,
      status: 'failed',
      error_message: error.message,
    };
  }
};

export default runSecurityAgent;