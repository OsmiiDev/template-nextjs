import {randomBytes, randomUUID} from 'crypto';
import {NextApiRequest, NextApiResponse} from 'next';
import {alchemy} from '../alchemy/[method]';
import {conversations, openai} from '../conversation';

/**
 * @description - Begins a conversation
 * @param {NextApiRequest} req - Request object
 * @param {NextApiResponse} res - Response object
 * @return {Promise<void>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!req.body) {
    return res.status(400).end(JSON.stringify({
      message: 'No body',
      success: false,
    }));
  }
  const {nft} = req.body;
  const id = randomUUID(); // Creates a random ID for the conversation
  const token = randomBytes(64).toString('hex'); // Creates a secure token for authentication

  // Fetch NFT metadata
  const data = await alchemy.nft.getNftMetadata(nft[0], nft[1]).catch(() => null);
  if (!data) {
    return res.status(400).end(JSON.stringify({
      message: 'Invalid NFT',
      success: false,
    }));
  }

  // Create an object containing the NFT's attributes
  let attributes: Record<string, unknown>[] = [];
  if (data.rawMetadata?.attributes) {
    if (Array.isArray(data.rawMetadata.attributes)) attributes = data.rawMetadata.attributes;
    else {
      attributes = Object.entries(data.rawMetadata.attributes).map(([key, value]) => ({
        trait_type: key,
        value,
      }));
    }
  }

  // Format the attributes into a string
  const attributeText = attributes?.map((attribute) => `${attribute.trait_type}: ${attribute.value}`).join('\n');

  // Template for the prompt that initializes the conversation with the end user
  // eslint-disable-next-line max-len
  const PROMPT = `For the remainder of the conversation, pretend you are a character with the name ${data.title}. ${data.description ? `Here's a brief description of you: ${data.description}.` : ''}
    
You have the following attributes:
    
${attributeText || 'No attributes'}

You are to act in accordance with these attributes.

In accordance with these attributes, create an interesting backstory that you will share with the user when specifically requested.
    
If you understand these instructions, please reply with "OK".`;

  // Registers the conversation
  conversations[id] = {
    messages: [
      {
        content: PROMPT,
        role: 'system',
      },
    ],
    metadata: data,
    nft,
    token,
    voice: 'en-US/en-US-Wavenet-A/MALE', // Default voice
  };

  // Create the first response (should be OK)
  const completion = await openai.createChatCompletion({
    messages: conversations[id].messages,
    model: 'gpt-3.5-turbo',
  }).catch(() => null);

  if (!completion || !completion.data.choices[0].message?.content) {
    res.status(400).end(JSON.stringify({
      message: 'Failed to create completion',
      success: false,
    }));
    return;
  }

  // Add message to conversation
  conversations[id].messages.push({
    content: completion.data.choices[0].message?.content,
    role: 'assistant',
  });

  // Send the response to the user
  res.end(JSON.stringify({
    id,
    success: true,
    token,
  }));
}
