'use server';

import {Nft} from 'alchemy-sdk';
import {NextApiRequest, NextApiResponse} from 'next';
import {Configuration, OpenAIApi} from 'openai';

// Object for storing conversation data
export interface IConversation {
  messages: {role: 'system' | 'assistant' | 'user', content: string}[]; // A list of all messages in the conversation
  // SYSTEM: Messages sent by the system (initializes the conversation)
  // ASSISTANT: Messages sent by the assistant (ChatGPT)
  // USER: Messages sent by the user (the client)
  metadata: Nft | null; // Metadata of the NFT
  nft: string; // The contract ID of the NFT
  token: string; // The token used to authenticate the user
  voice: string; // The voice used by the assistant
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
});
export const openai = new OpenAIApi(configuration); // Creates an OpenAI instance to generate responses
export const conversations: {[key: string]: IConversation} = {
  'test': {
    messages: [],
    metadata: null,
    nft: '0x000000000000',
    token: 'test',
    voice: 'en-US',
  },
};

export const setConversation = (id: string, data: IConversation) => {
  conversations[id] = data;
};

/**
 * @description - Alchemy proxy API
 * @param {NextApiRequest} req - Request object
 * @param {NextApiResponse} res - Response object
 * @return {Promise<void>}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(conversations);
  res.status(200).json({message: 'Hello World'});

  return;
}
