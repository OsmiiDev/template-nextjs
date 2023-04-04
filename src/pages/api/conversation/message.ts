import axios from 'axios';
import {NextApiRequest, NextApiResponse} from 'next';
import {conversations, openai} from '../conversation';

/**
 * @description - Alchemy proxy API
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
  const {
    message, conversation, token,
  } = req.body;

  // Conversation does not exist/Authentication failed
  console.log(conversations);
  if (!conversations[conversation] || conversations[conversation].token !== token) {
    return res.status(400).end(JSON.stringify({
      message: 'Invalid conversation',
      success: false,
    }));
  }

  // Add the message sent by the user to the conversation
  conversations[conversation].messages.push({
    content: message,
    role: 'user',
  });

  // Generate a response with OpenAI
  const completion = await openai.createChatCompletion({
    messages: conversations[conversation].messages,
    model: 'gpt-3.5-turbo',
  });

  // Synthesize audio data for the response
  let response;
  if (process.env.env !== 'DEV') {
  // Only use in production

    response = await axios.post('https://texttospeech.googleapis.com/v1/text:synthesize', {
      audioConfig: {audioEncoding: 'MP3'},
      input: {text: completion.data.choices[0].message?.content},
      voice: {
        languageCode: conversations[conversation].voice.split('/')[0] || 'en-US',
        name: conversations[conversation].voice.split('/')[1] || 'en-US-Wavenet-A',
        ssmlGender: conversations[conversation].voice.split('/')[2] || 'MALE',
      },
    }, {headers: {'x-goog-api-key': process.env.GOOGLE_API_KEY!}});
  }

  // Add ChatGPT's response to the conversation
  conversations[conversation].messages.push({
    content: completion.data.choices[0].message!.content!,
    role: 'assistant',
  });

  // Send the response to the client
  res.end(JSON.stringify({
    audio: response?.data.audioContent,
    messages: conversations[conversation].messages.slice(2),
    success: true,
  }));

  return;
}
