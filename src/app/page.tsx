'use client';

import React from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {createClient, configureChains, mainnet, WagmiConfig} from 'wagmi';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {CoinbaseWalletConnector} from 'wagmi/connectors/coinbaseWallet';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {WalletConnectConnector} from 'wagmi/connectors/walletConnect';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {publicProvider} from 'wagmi/providers/public';
import Header from '@/components/Header';

import styles from './page.module.css';
import {Button} from '@mantine/core';

// Registers Wagmi client
const {
  chains, provider, webSocketProvider,
} = configureChains(
  [mainnet],
  [publicProvider()],
);

const client = createClient({
  autoConnect: true,
  connectors: [
    new CoinbaseWalletConnector({
      chains,
      options: {appName: 'talktonft'},
    }),
    new WalletConnectConnector({
      chains,
      options: {projectId: '737e2cfcfa392212e600ebbaab3de761'},
    }),
  ],
  provider,
  webSocketProvider,
});

/**
 * @description - Home page
 * @return {React.ReactElement} The home page
 */
export default function Home() {
  return (
    <>
      <WagmiConfig client={client}>
        <Header />
        <div className='flex h-screen w-full flex-col items-center justify-center bg-primary p-10'>
          <div className='mb-12 w-10/12'>
            <div className='w-6/12'>
              <h1 className='w-full font-sans text-7xl font-normal leading-[1.35] text-primary'>
                More&#x2004;than&#x2004;just&#x2004;an&#x2004;<span className={`${styles.gradientText}`}>image</span>
              </h1>

              <div className='mt-4 flex h-36'>
                <div className='ml-8 mt-4 h-36 w-10 rounded-bl-md border-b-2 border-l-2 border-secondary'></div>
                <div className='ml-8 mt-8 w-8/12'>
                  <p className='font-jakarta text-xl text-secondary'>Give your NFTs an unique personality and bring it to life with the power of AI</p>

                  <Button className='mt-12 h-12 rounded-xl bg-invert px-5 font-jakarta text-base font-normal text-invert hover:bg-invert-hover'>Get started</Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </WagmiConfig>
    </>
  );
}
