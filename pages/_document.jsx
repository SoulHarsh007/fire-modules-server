import Document, {Html, Head, Main, NextScript} from 'next/document';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @augments Document
 * @class
 */
class MyDocument extends Document {
  /**
   * @function render
   * @description adds head meta to page
   * @returns {any} -
   */
  render() {
    return (
      <Html>
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicons/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicons/favicon-16x16.png"
          />
          <link rel="manifest" href="/favicons/site.webmanifest" />
          <link
            rel="mask-icon"
            href="/favicons/safari-pinned-tab.svg"
            color="#5bbad5"
          />
          <link rel="shortcut icon" href="/favicons/favicon.ico" />
          <meta
            name="apple-mobile-web-app-title"
            content="RebornOS Fire Modules Server"
          />
          <meta
            name="application-name"
            content="RebornOS Fire Modules Server"
          />
          <meta name="msapplication-TileColor" content="#008e8b" />
          <meta
            name="msapplication-config"
            content="/favicons/browserconfig.xml"
          />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
