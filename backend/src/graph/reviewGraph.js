import { StateGraph, END } from '@langchain/langgraph';
import runCodeQualityAgent from '../agents/codeQualityAgent.js';
import runSecurityAgent from '../agents/securityAgent.js';
import runDependencyAgent from '../agents/dependencyAgent.js';
import runSummarizerAgent from '../agents/summarizerAgent.js';

// define the state shape that flows through the graph
const graphState = {
  diff: {
    value: (old, next) => next,
    default: () => '',
  },
  agentResults: {
    value: (old, next) => [...old, ...next],
    default: () => [],
  },
  summaryOutput: {
    value: (old, next) => next,
    default: () => null,
  },
};

// node: run all 3 agents in parallel
const runAgentsNode = async (state) => {
  const [codeQuality, security, dependency] = await Promise.all([
    runCodeQualityAgent(state.diff),
    runSecurityAgent(state.diff),
    runDependencyAgent(state.diff),
  ]);

  return { agentResults: [codeQuality, security, dependency] };
};

// node: summarize all agent outputs into final comment
const runSummarizerNode = async (state) => {
  const summary = await runSummarizerAgent(state.agentResults);
  return {
    agentResults: [summary],
    summaryOutput: summary.output,
  };
};

// build the graph
const buildReviewGraph = () => {
  const graph = new StateGraph({ channels: graphState });

  graph.addNode('run_agents', runAgentsNode);
  graph.addNode('summarizer', runSummarizerNode);

  graph.setEntryPoint('run_agents');
  graph.addEdge('run_agents', 'summarizer');
  graph.addEdge('summarizer', END);

  return graph.compile();
};

export default buildReviewGraph;