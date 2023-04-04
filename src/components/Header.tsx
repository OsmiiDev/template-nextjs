'useClient';

import {Button} from '@mantine/core';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {IoWalletOutline} from 'react-icons/io5';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {useAccount, useConnect} from 'wagmi';

export const Header: React.FC = () => {
  const router = useRouter();

  const {
    address, isConnected,
  } = useAccount();
  const {
    connect, connectors,
  } = useConnect();
  // const {disconnect} = useDisconnect();

  if (isConnected) {
    document.cookie = `address=${address}; path=/; max-age=31536000`;
    router.push('/app');
  }

  useEffect(() => {
    const header = document.getElementById('component-header')!;

    // Detect when user scrolls from top of page
    const _scrollListener = () => {
      if (window.scrollY > 0) {
        header.classList.add('bg-white');
        header.classList.add('shadow');
      } else {
        header.classList.remove('bg-white');
        header.classList.remove('shadow');
      }
    };

    // Add scroll listener
  });

  return (
    <div className='fixed h-[5.75rem] w-full p-5' id='component-header'>
      <div className='box-border flex h-full w-full flex-row items-center justify-between rounded-xl bg-[rgba(var(--background-secondary),0.7)] backdrop-blur-md'>
        <div>
          <Link href='/'>
            <p className='ml-8 font-sans text-lg font-medium tracking-wide text-primary'>talktonft</p>
          </Link>
        </div>
        <div>
        </div>
        <div className='flex h-full items-center'>
          <Link className='m-0 mr-8 font-jakarta text-[13px] font-medium text-primary duration-200 hover:text-secondary' href='/'> About </Link>
          <Link className='m-0 mr-8 font-jakarta text-[13px] font-medium text-primary duration-200 hover:text-secondary' href='/'> Pricing </Link>
          <Link className='m-0 mr-8 font-jakarta text-[13px] font-medium text-primary duration-200 hover:text-secondary' href='/'> Resources </Link>
          <Button
            className='mr-2 h-9 rounded-lg bg-tertiary px-4 font-sans font-medium tracking-wide text-primary hover:!bg-tertiary'
            onClick={() => {
              connect({connector: connectors[0]});
            }}
          >
            <IoWalletOutline className='mr-2' /> <p className='font-jakarta text-sm'> Connect wallet </p>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
