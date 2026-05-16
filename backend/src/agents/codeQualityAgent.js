import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import createGroqModel from '../services/groqService.js';

const SYSTEM_PROMPT = `You are a senior software engineer reviewing a Pull Request.
Analyze the provided code diff for code quality issues only.

Check for:
- Poor naming conventions (variables, functions, classes)
- Functions that are too long or do too many things
- Deeply nested logic that hurts readability
- Dead code or commented-out code left behind
- Missing error handling
- Code duplication
- Single responsibility violations

Respond in this exact format:

SEVERITY: [LOW | MEDIUM | HIGH]
ISSUES FOUND: [number]

FINDINGS:
- [finding 1]
- [finding 2]
(list only real issues, skip if none)

SUGGESTION:
[one most important improvement to make]

Be concise. Be specific. Reference the actual filename and line when possible.
If the code looks clean, say so briefly and set ISSUES FOUND: 0.`;

const runCodeQualityAgent = async (diff) => {
  const start = Date.now();
  const model = createGroqModel(0.2);

  try {
    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(`Review this diff:\n\n${diff}`),
    ]);

    return {
      agent_name: 'code_quality',
      output: response.content,
      input_tokens: response.usage_metadata?.input_tokens ?? null,
      output_tokens: response.usage_metadata?.output_tokens ?? null,
      execution_time_ms: Date.now() - start,
      status: 'success',
      error_message: null,
    };
  } catch (error) {
    return {
      agent_name: 'code_quality',
      output: null,
      input_tokens: null,
      output_tokens: null,
      execution_time_ms: Date.now() - start,
      status: 'failed',
      error_message: error.message,
    };
  }
};

export default runCodeQualityAgent;