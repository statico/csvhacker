import { ColorModeScript } from "@chakra-ui/react"
import { NextSeo } from "next-seo"
import Document, { Head, Html, Main, NextScript } from "next/document"
import * as React from "react"
import { ModalProvider } from "../hooks/useModals"
import theme from "../theme"

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <NextSeo
          title="csvhacker - an SQL-powered CSV browser"
          description="A SQL-powered tool to quickly view, filter, map, and reduce CSV/TSV files in the browser. Shareable links for easy collaboration with non-engineers"
          additionalLinkTags={[{ rel: "icon", href: "/favicon.png" }]}
        />
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
