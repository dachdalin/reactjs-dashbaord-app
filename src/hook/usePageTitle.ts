import { useEffect } from 'react'

const APP_NAME = 'ReactJS Dashboard'

/**
 * Sets the browser tab title to "<page> | ReactJS Dashboard"
 * and restores the default on unmount.
 *
 * Usage: usePageTitle('Dashboard')
 */
export function usePageTitle(pageTitle: string) {
  useEffect(() => {
    const previous = document.title
    document.title = `${pageTitle} | ${APP_NAME}`
    return () => {
      document.title = previous
    }
  }, [pageTitle])
}
