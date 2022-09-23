import '../styles/globals.css'

import { MsalProvider } from '@azure/msal-react'
import {msalInstance} from '../config'
import AppBar from '../components/AppBar'
// 


function MyApp({ Component, pageProps }) {
  return <MsalProvider instance={msalInstance}>
            <AppBar/>
            <Component {...pageProps} />
        </MsalProvider>
}

export default MyApp
