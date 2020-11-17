import { debounce } from "debounce"
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

const setUrlStateImmediately = (state: any): void => {
  if (!process.browser) return

  const obj = JSON.parse(JSON.stringify(state))
  Object.keys(obj).forEach((key) => {
    if (obj[key] == null) delete obj[key]
  })

  const url = new URL(document.location.href)
  url.hash = Object.keys(obj).length ? rison.encode_object(obj) : ""
  history.pushState(null, "", url.toString())
}

export const setUrlState = debounce(setUrlStateImmediately, 500)
