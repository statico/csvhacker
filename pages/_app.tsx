import { AppProps } from "next/app"
import React, { Suspense } from "react"
import { RecoilRoot } from "recoil"

import "../styles.css"

const MyApp = ({ Component, pageProps }: AppProps) => {
  // If we use Suspense in the server-side we get an error, "Cannot hydrate Suspense in legacy mode."
  if (process.browser) {
    return (
      <Suspense fallback="Loading...">
        <RecoilRoot>
          <Component {...pageProps} />
        </RecoilRoot>
      </Suspense>
    )
  } else {
    return (
      <RecoilRoot>
        <Component {...pageProps} />
      </RecoilRoot>
    )
  }
}

export default MyApp
