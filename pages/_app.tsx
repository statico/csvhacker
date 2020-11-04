import { AppProps } from "next/app"
import React from "react"
import { RecoilRoot } from "recoil"

import "../styles.css"

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  )
}

export default MyApp
