import Head from "next/head"
import dynamic from "next/dynamic"
import packageJSON from "../package.json"

// We don't need or want SSR, which messes up Recoil somehow.
// https://nextjs.org/docs/advanced-features/dynamic-import#with-no-ssr
const MainNoSSR = dynamic(() => import("../components/Main"), { ssr: false })

const Page = () => {
  return (
    <>
      <Head>
        <title>CSVHacker {packageJSON.version}</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <MainNoSSR />
    </>
  )
}

export default Page
