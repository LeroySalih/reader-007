import '../styles/globals.css'

import { MsalProvider } from '@azure/msal-react'
import {msalInstance} from '../config'
import AppBar from '../components/AppBar'
// 

import { SnackbarProvider, enqueueSnackbar } from 'notistack'

import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#0971f1',
      darker: '#053e85',
    },
    neutral: {
      main: '#ffffff',
      contrastText: '#fff',
    },
  },
});

function MyApp({ Component, pageProps }) {
  return <MsalProvider instance={msalInstance}>
          <ThemeProvider theme={theme}>
            <AppBar/>            
            <Component {...pageProps} />
          </ThemeProvider>  
        </MsalProvider>
}

export default MyApp
