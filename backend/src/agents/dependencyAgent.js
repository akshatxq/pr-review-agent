import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import createGroqModel from '../services/groqService.js';

const SYSTEM_PROMPT = `You are a software engineer reviewing dependency changes in a Pull Request.
Analyze the provided code diff for dependency-related concerns only.

Check for:
- New packages being added (are they necessary? well maintained?)
- Packages being removed (could break existing functionality?)
- Version changes (major version bumps that could break things)
- Packages with known security issues
- Overly broad version ranges (e.g. "*" or ">=1.0.0")
- Dev dependencies accidentally added as production dependencies

Respond in this exact format:

SEVERITY: [LOW | MEDIUM | HIGH]
ISSUES FOUND: [number]

FINDINGS:
- [finding 1]
- [finding 2]
(list only real issues, skip if none)

SUGGESTION:
[one most important recommendation]

If no dependency files were changed, say "No dependency changes detected" and set ISSUES FOUND: 0.
Be concise and specific.`;

const runDependencyAgent = async (diff) => {
  const start = Date.now();
  const model = createGroqModel(0.2);

  try {
    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(`Review this diff:\n\n${diff}`),
    ]);

    return {
      agent_name: 'dependency',
      output: response.content,
      input_tokens: response.usage_metadata?.input_tokens ?? null,
      output_tokens: response.usage_metadata?.output_tokens ?? null,
      execution_time_ms: Date.now() - start,
      status: 'success',
      error_message: null,
    };
  } catch (error) {
    return {
      agent_name: 'dependency',
      output: null,
      input_tokens: null,
      output_tokens: null,
      execution_time_ms: Date.now() - start,
      status: 'failed',
      error_message: error.message,
    };
  }
};

export default runDependencyAgent;