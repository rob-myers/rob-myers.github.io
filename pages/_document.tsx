import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { extractCss } from 'goober'

class MyDocument extends Document<{ css: string }> {
  static async getInitialProps({ renderPage }: DocumentContext) {
    const page = await renderPage()
    const css = extractCss()
    return { ...page, css }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik" />
          <style
            id="_goober"
            dangerouslySetInnerHTML={{ __html: ' ' + this.props.css }}
          />
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