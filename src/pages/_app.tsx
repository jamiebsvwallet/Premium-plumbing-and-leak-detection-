import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    // Initialize Socket.IO
    fetch('/api/socket').catch(console.error)
  }, [])

  return <Component {...pageProps} />
}
