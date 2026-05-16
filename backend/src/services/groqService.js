import { ChatGroq } from '@langchain/groq';

const createGroqModel = (temperature = 0.2) => {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    temperature,
    maxTokens: 1024,
  });
};

export default createGroqModel;
