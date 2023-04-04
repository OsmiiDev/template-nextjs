'use client';

import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

import styles from './page.module.css';

import {Image, LoadingOverlay, ScrollArea, Textarea} from '@mantine/core';
import {Nft} from 'alchemy-sdk';
import axios from 'axios';
import {HiOutlinePaperAirplane} from 'react-icons/hi';

/**
 * @description - Animate page
 * @return {React.ReactElement} - Live chat page
 */
export default function Animate() {
  // Conversation data
  const [nft, setNft] = useState<Nft>();
  const [conversation, setConversation] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [messages, setMessages] = useState<{content: string, role: string}[]>([]);

  useEffect(() => {
    (async () => {
      // Grab NFT contract address and information
      const hash = window.location.hash.slice(1).split('/');
      const _nft = (await axios.get(`/api/alchemy/getNftMetadata?contractAddress=${hash[0]}&tokenId=${hash[1]}`)).data as Nft;
      setNft(_nft);
      const response = await axios.post('/api/conversation/begin', {nft: [hash[0], hash[1]]}, {headers: {'Content-Type': 'application/json'}}).catch(() => null);

      if (!response || !response.data.success) {
        console.log(response);
        return;
      }

      // Initialize conversation voice
      const voice = await axios.post('/api/conversation/begin_voice', {
        id: response.data.id,
        token: response.data.token,
      }, {headers: {'Content-Type': 'application/json'}}).catch(() => null);

      if (!voice || !voice.data.success) {
        console.log(voice);
        setTimeout(() => {
          window.location.reload();
        }, 4000);
        return;
      }

      setToken(response.data.token);
      setConversation(response.data.id);
      setMessages([]);
    })();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => { };
  }, []);

  return (
    <div className='float-left m-0 h-screen w-full bg-primary p-0'>
      <div className={`${styles.cell} ml-5 mt-5 flex h-[calc(100%-40px)] w-[calc(100%-40px)] overflow-auto`}>
        <div className='hidden shrink-0 p-4 sm:block sm:w-32 md:w-60 lg:w-96'>
          <Image alt='thumbnail' className='aspect-square w-full rounded-md' src={nft?.media[0].thumbnail} />
        </div>
        <div className={`${styles.separator} m-1 hidden h-[calc(100%-8px)] w-px shrink-0 sm:flex`}> </div>
        <div className='relative flex grow flex-col overflow-hidden p-4'>
          <ScrollArea>
            <div className='float-left flex w-full shrink flex-col' id='messages'>
            </div>
          </ScrollArea>
          <div className='flex w-full grow flex-col justify-end pt-4'>
            <Textarea
              autosize
              rightSection={
                <div
                  className='mr-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-accent p-2 transition-colors hover:bg-accent-hover'
                  id='messageButton'
                  onClick={async () => {
                    // Handles sending a message

                    const message = document.getElementById('message') as HTMLTextAreaElement;
                    const messageText = message.value;
                    message.value = '';

                    if (messageText.length > 0) {
                      console.log(messageText);
                      const messagesDiv = document.getElementById('messages') as HTMLDivElement;

                      const userMessageElement = (
                        <div key={messages.length} className='mt-4 w-full'>
                          <div className={`${styles.message} float-right max-w-2xl rounded-md bg-accent p-4 py-2 font-jakarta text-primary`}>
                            {messageText}
                          </div>
                        </div>
                      );

                      // Adds user message to the DOM
                      const userMessageDiv = document.createElement('div');
                      ReactDOM.render(userMessageElement, userMessageDiv);
                      messagesDiv.appendChild(userMessageDiv);
                      messagesDiv.scrollTop = messagesDiv.scrollHeight;

                      // Queries API for response
                      const response = await axios.post('/api/conversation/message', {
                        conversation: conversation,
                        message: messageText,
                        token: token,
                      }, {headers: {'Content-Type': 'application/json'}});

                      // Updates messages
                      setMessages(response.data.messages);

                      // Adds response to the DOM
                      const messsage = response.data.messages[response.data.messages.length - 1];
                      const messageElement = (
                        <div key={response.data.messages.length - 1} className='mt-4 flex w-full'>
                          <div className='float-left mr-2 h-12 w-12 shrink-0 overflow-hidden rounded-full sm:hidden'>
                            <Image alt='thumbnail' className='h-full w-full' src={nft?.media[0].thumbnail} />
                          </div>
                          <div className={`${styles.message} float-left max-w-2xl rounded-md bg-primary p-4 font-jakarta text-primary`}>
                            {messsage.content}
                          </div>
                        </div>
                      );

                      const messageDiv = document.createElement('div');
                      ReactDOM.render(messageElement, messageDiv);
                      messagesDiv.appendChild(messageDiv);
                      messagesDiv.scrollTop = messagesDiv.scrollHeight;

                      // Plays synthesized audio
                      const audioContent = response.data.audio;
                      if (audioContent === undefined) return;
                      const audio = new Audio(`data:audio/wav;base64,${audioContent}`);
                      audio.play();
                    }
                  }}>
                  <HiOutlinePaperAirplane className='rotate-90' color='var(--text-primary)' />
                </div>
              }
              styles={{
                input: {
                  backgroundColor: 'rgb(var(--background-primary))',
                  border: '1px solid rgb(var(--border-primary))',
                  color: 'rgb(var(--text-primary))',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '16px',
                },
              }}
              disabled={conversation === ''}
              id='message'
              maxLength={4000}
              maxRows={10}
              minRows={2}
              rightSectionWidth={50}
              spellCheck={false}
              onKeyDown={(e) => {
                // Sends a message when the enter key is pressed, but not when shift is held
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  document.getElementById('messageButton')?.click();
                }
              }}
            />

            <LoadingOverlay
              overlayColor='rgb(var(--background-primary))'
              overlayOpacity={0.5}
              visible={conversation == ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
