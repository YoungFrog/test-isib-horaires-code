import { useEffect } from 'react'
import { Resource } from '../utils/fetchCalendars'

/**
 * Define the document title according to currently selected resource
 *
 * @param resource current resource
 */
function useTitle(resource?: Resource) {
  useEffect(() => {
    const defaultTitle = 'ESI Horaires'

    document.title = resource
      ? `${resource.name} - ${defaultTitle}`
      : defaultTitle
  }, [resource])
}

export default useTitle
