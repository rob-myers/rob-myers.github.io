import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document<{ css: string }> {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument