import rison from "rison-node"

// Using encode_object/decode_object instead of encode/decode saves some parens.

export const getUrlState = (): any => {
  if (!process.browser || !document.location.hash) return {}
  try {
    return rison.decode_object(document.location.hash.substr(1)) || {}
  } catch (err) {
    console.error("Could not parse state from URL")
    return {}
  }
}

export const setUrlState = (state: any): void => {
  if (!process.browser) return
  const url = new URL(document.location.href)
  url.hash = Object.keys(state).length ? rison.encode_object(state) : ""
  history.pushState(null, "", url.toString())
}
