import '../styles/globals.css'

import { MsalProvider } from '@azure/msal-react'
import {msalInstance} from '../config'
import AppBar from '../components/AppBar'
// 

import { SnackbarProvider, enqueueSnackbar } from 'notistack'

function MyApp({ Component, pageProps }) {
  return <MsalProvider instance={msalInstance}>
            <AppBar/>
            <SnackbarProvider >
              <Component {...pageProps} />
            </SnackbarProvider>
            
        </MsalProvider>
}

export default MyApp
