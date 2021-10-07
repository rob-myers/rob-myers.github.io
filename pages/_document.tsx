import { extractCss } from 'goober'
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

export default class MyDocument extends Document<{ css: string }> {

  static async getInitialProps({ renderPage }: DocumentContext) {
    const page = await renderPage()
    const css = extractCss()
    return { ...page, css }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="description" content="A Game AI focused roguelike, built blog by blog." />
          <link rel="icon" href="/favicon.ico" />
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
