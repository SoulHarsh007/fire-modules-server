import 'tailwindcss/tailwind.css';
import Head from 'next/head';
import {useEffect} from 'react';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @description custom app component
 * @function app
 * @param {import('next/app').AppProps} AppProps - next.js app props
 * @returns {any} - returns components
 */
export default function App({Component, pageProps}) {
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
