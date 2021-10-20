import 'tailwindcss/tailwind.css';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @description custom app component
 * @function app
 * @param {import('next/app').AppProps} AppProps - next.js app props
 * @returns {any} - returns components
 */
export default function app({Component, pageProps}) {
  return <Component {...pageProps} />;
}
