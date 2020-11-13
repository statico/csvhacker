import rison from "rison-node"

export const getUrlState = (): any => {
  if (!process.browser || !document.location.hash) return {}
  try {
    return rison.decode(document.location.hash.substr(1)) || {}
  } catch (err) {
    console.error("Could not parse state from URL")
    return {}
  }
}

export const setUrlState = (state: any): void => {
  if (!process.browser) return
  const url = new URL(document.location.href)
  url.hash = Object.keys(state).length ? rison.encode(state) : ""
  history.pushState(null, "", url.toString())
}
