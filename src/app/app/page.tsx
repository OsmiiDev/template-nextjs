'use client';

import React, {useEffect, useState} from 'react';

import styles from './page.module.css';

import {Button, Image, LoadingOverlay, SimpleGrid, Text} from '@mantine/core';
import {OwnedNft, OwnedNftsResponse} from 'alchemy-sdk';
import axios from 'axios';

/**
 * @description - Application page
 * @return {React.ReactElement} The application dashboard
 */
export default function App() {
  const [nfts, setNfts] = useState<OwnedNft[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // List of NFTs owned by the wallet address
  useEffect(() => {
    // Read address cookie
    const address = document.cookie.split(';').find((c) => c.trim().startsWith('address='))?.split('=')[1];

    (async () => {
      const response =
        await axios.get(
          `/api/alchemy/getNftsForOwner?ownerAddress=${address}`,
        ).catch(() => null);

      if (!response || response.status !== 200 || response.data.success === false || response.data.error) {
        setError('An error occurred. Please try again later.');
        return;
      }

      const {data} = response;
      const _nfts = (data as OwnedNftsResponse).ownedNfts;
      console.log(_nfts);
      setNfts(_nfts);
    })();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  });

  return (
    <div className='float-left m-0 h-screen w-full bg-primary p-0'>
      <div className={`${styles.cell} relative ml-5 mt-5 h-[calc(100%-40px)] w-[calc(100%-40px)] overflow-auto`}>
        {error && (
          <div className='flex h-full flex-col items-center justify-center'>
            <p className='font-jakarta text-2xl text-primary'>{error}</p>
            <Button
              className='mt-5'
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Go back
            </Button>
          </div>
        )}

        {(nfts === undefined) && (
          <>
            <LoadingOverlay
              visible
              overlayColor='var(--background-primary)'
              overlayOpacity={0.5}
            />
          </>
        )}

        {(nfts !== undefined && nfts?.length === 0 && !error) && (
          <div className='flex h-full flex-col items-center justify-center'>
            <Text className='font-jakarta text-2xl text-primary'>No NFTs found</Text>
            <Button
              className='mt-5'
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Go back
            </Button>
          </div>
        )}

        {(nfts && nfts.length > 0 && !error) && (
          <SimpleGrid
            breakpoints={[
              {
                cols: 1,
                maxWidth: 768,
              },
            ]}
            cols={6}
            m={8}
            spacing={8}
          >
            {nfts?.filter((nft) => nft.media[0]?.thumbnail).map((nft, i) => {
              return <NFTCard key={i} nft={nft} />;
            })}
          </SimpleGrid>
        )}

      </div>
    </div>
  );
}

export interface INFTCardProps {
  nft: OwnedNft;
}

/**
 * @description - Card displaying NFT
 * @param {INFTCardProps} props - NFT card props
 * @return {React.ReactElement} The NFT card
 */
function NFTCard({nft}: INFTCardProps) {
  // Card displaying NFT

  return (
    <div className='flex w-full flex-col items-center justify-center rounded-md bg-secondary p-2'>
      {nft.media[0]?.thumbnail ? (
        <>
          <Image
            alt='NFT Thumbnail'
            className='aspect-square w-full rounded-md'
            src={nft.media[0]?.thumbnail}
          />
          <Button
            styles={{
              root: {
                ':hover': {backgroundColor: 'rgba(var(--background-accent),1)'},
                'backgroundColor': 'rgba(var(--background-accent),0.75)',
                'transition': 'background-color 0.2s ease-in-out',
              },
            }}
            className='mt-2 w-full font-jakarta font-medium'
            onClick={() => {
              window.open(
                `/animate#${nft.contract.address}/${nft.tokenId}`,
                '_blank',
              );
            }}
          >
            Animate
          </Button>
        </>
      ) : null}
    </div>
  );
}
