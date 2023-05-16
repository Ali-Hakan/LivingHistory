import '@/styles/globals.css'
import { LoadScript } from '@react-google-maps/api'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY || ""} libraries={["places"]}>
      <Component {...pageProps} />
    </LoadScript>
  )
}
