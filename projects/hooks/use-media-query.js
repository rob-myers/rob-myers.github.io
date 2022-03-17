import React from 'react'

/**
 * https://usehooks-ts.com/react-hook/use-media-query
 * @param {string} query 
 * @returns {boolean}
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(getMatches(query))

  function handleChange() {
    setMatches(getMatches(query))
  }

  React.useEffect(() => {
    const matchMedia = window.matchMedia(query)
    // Triggered at the first client-side load and if query changes
    handleChange()
    // Listen matchMedia
    matchMedia.addEventListener('change', handleChange)
    return () => {
      matchMedia.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches;
}

/**
 * @param {string} query 
 * @returns {boolean}
 */
function getMatches(query) {
  return typeof window !== 'undefined'
    ? window.matchMedia(query).matches
    : false;
}
