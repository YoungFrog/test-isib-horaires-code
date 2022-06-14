import { SetStateAction, Dispatch, useCallback, useEffect, useRef } from 'react'
import { Nullable } from '../utils/types'

/**
 * Mirror the given states to the query string and back, using pushState and popstate
 *
 * When the component loads, the state is taken from url (if one parameter is not present, a default value can be used, otherwise it's set to null)
 *
 * Afterwards, state and query string will be kept in sync :
 * - every time the component renders, pushState is called
 * - whenever popstate is fired, the state is changed to reflect that
 *
 * @param params an array of tuples
 */
function useSearchParams(
  params: [
    queryParamName: string,
    state: Nullable<string>,
    setState?: Dispatch<SetStateAction<Nullable<string>>>,
    defaultState?: string
  ][]
) {
  /**
   * Global flag to avoid pushstate when we're just resetting states from url
   */
  const isStateBeingReset = useRef(false)
  const resetStatesFromUrl = useCallback(() => {
    isStateBeingReset.current = true
    const search = new URL(location.href).searchParams
    for (const [queryParamName, state, setState, defaultState] of params) {
      const wantedState = search.has(queryParamName)
        ? search.get(queryParamName)
        : defaultState ?? null
      if (setState && wantedState !== state) {
        setState(wantedState)
      }
    }
  }, [params])

  // because of the empty second argument, this should run once (a creation time)
  useEffect(() => {
    resetStatesFromUrl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // if state is being reset from its URL value, do not pushstate
    if (isStateBeingReset.current) {
      isStateBeingReset.current = false
      return
    }
    const url = new URL(location.href)
    const initialSearch = url.searchParams.toString()
    for (const [keyname, state] of params) {
      if (state === undefined || state === null) {
        url.searchParams.delete(keyname)
      } else {
        url.searchParams.set(keyname, state)
      }
    }
    if (url.searchParams.toString() !== initialSearch) {
      history.pushState({}, '', url)
    }
  })
  useEffect(() => {
    window.addEventListener('popstate', resetStatesFromUrl)
    return () => window.removeEventListener('popstate', resetStatesFromUrl)
  })
}
export default useSearchParams
