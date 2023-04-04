import axios from 'axios';
import {NextApiRequest, NextApiResponse} from 'next';
import {conversations, openai} from '../conversation';

/**
 * @description - Picks a gender and voice for the assistant
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
    id, token,
  } = req.body;
  console.log(req.body);
  console.log(conversations);
  if (!id || !token || !conversations[id]) {
    return res.status(400).end(JSON.stringify({
      message: 'Invalid parameters',
      success: false,
    }));
  }
  if (conversations[id].token !== token) {
    return res.status(400).end(JSON.stringify({
      message: 'Invalid token',
      success: false,
    }));
  }

  const attributes = conversations[id].metadata?.rawMetadata?.attributes;
  const data = conversations[id].metadata;
  if (!data) return res.status(400).end(JSON.stringify({success: false}));
  // Create a string containing the attrigutes to the NFT
  const traits = attributes?.reduce((acc, curr, index) => {
    if (index === 0) acc += `With ${(curr.trait_type as string).toUpperCase()} of ${curr.value}`;
    else acc += `, with ${(curr.trait_type as string).toUpperCase()} of ${curr.value}`;

    return acc;
  }, '') || 'No attributes';

  // Allow ChatGPT to select whether the voice is masculine or feminine
  // eslint-disable-next-line max-len
  const GENDER_PROMPT = `Imagine you are a voice expert recommending someone to assign a voice to a set of physical traits. Given this list of traits, describe their voice as appearing either masculine or feminine.

The person's name is ${data.title}.${data.description ? `\n\nA brief description of the person: ${data.description}.` : ''}

The person has these traits: "${traits}".

Would this character's voice appear more MASCULINE or FEMININE? Respond with one word. Do not include any other text. Do not respond with anything that is not either "MASCULINE" or "FEMININE".
`;
  const genderCompletion = await openai.createChatCompletion({
    messages: [
      {
        content: GENDER_PROMPT,
        role: 'system',
      },
    ],
    model: 'gpt-3.5-turbo',
  });
  let gender = genderCompletion.data.choices[0].message?.content?.toUpperCase();
  gender = gender ?
    (gender.includes('MASCULINE') && !gender.includes('FEMININE')) ? 'MALE' :
      gender.includes('FEMININE') ? 'FEMALE' :
        Math.random() > 0.5 ? 'MALE' : 'FEMALE' :
    Math.random() > 0.5 ? 'MALE' : 'FEMALE';
  console.log(genderCompletion.data.choices[0].message?.content);

  // Get a list of voices from Google Cloud
  const voices = await axios.get('https://texttospeech.googleapis.com/v1/voices', {headers: {'x-goog-api-key': process.env.GOOGLE_API_KEY!}});
  const voiceText = voices.data.voices
    .filter((voice: {[key: string]: string | string[]}) => voice.ssmlGender === gender)
    .map((voice: {[key: string]: string | string[]}) => `${voice.languageCodes[0]} ${voice.name} ${voice.ssmlGender}`).join('\n');

  // Allow ChatGPT to select a voice to speak with
  // eslint-disable-next-line max-len
  const VOICE_PROMPT = `Imagine you are a voice expert recommending someone to assign a voice to a set of physical traits. From this list of voices, select one that someone from a foreign country with the following characteristics might have. ${data.description ? `\n\nA brief description of the person: ${data.description}.` : ''}

The person has these traits: "${traits}".

If the person would have an accent, choose the language that corresponds to the accent that they would have.

Prioritize choosing languages that are not English, unless the character appears to be from an English-speaking country or it is ambigious what language they speak.

Respond with one row. Do not include any other text. 

LANGUAGE NAME GENDER
${voiceText}`;

  const voiceCompletion = await openai.createChatCompletion({
    messages: [
      {
        content: VOICE_PROMPT,
        role: 'system',
      },
    ],
    model: 'gpt-3.5-turbo',
  }).catch(() => null);

  // If a voice is selected, set the voice for the conversation, otherwise use the default
  if (voiceCompletion && voiceCompletion.data.choices[0].message?.content) {
    const voiceLanguage = voiceCompletion.data.choices[0].message?.content?.split(' ')[0];
    const voiceName = voiceCompletion.data.choices[0].message?.content?.split(' ')[1];
    const voiceGender = voiceCompletion.data.choices[0].message?.content?.split(' ')[2];
    if (voiceLanguage && voiceName && voiceGender) conversations[id].voice = `${voiceLanguage}/${voiceName}/${voiceGender}`;
    console.log(`${voiceLanguage}/${voiceName}/${voiceGender}`);
  }

  console.log(conversations);

  // Send the response to the user
  res.end(JSON.stringify({
    id,
    success: true,
    token,
  }));
}
