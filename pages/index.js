import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import the main App component to avoid SSR issues
const App = dynamic(() => import('../components/App'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>BNB Xiangqi Game</title>
        <meta name="description" content="BNB Staking Xiangqi Game - Play Chinese Chess with BNB Staking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <App />
    </>
  );
}
