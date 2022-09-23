import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import Link from 'next/link'

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";


const ApplicationBar = () => {

    const {instance, accounts} = useMsal();

    const handleSignOut = () => {
        instance.logoutRedirect().catch(e => console.log(e))
    }

    const handleSignIn = () => {
        instance.loginRedirect().catch(e => console.error(e))
    }
    return (
        <AppBar position="static">
  <Toolbar variant="dense">
    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
      <MenuIcon />
    </IconButton>
    
    <Link href="/"          ><a>Home    </a></Link>
    <AuthenticatedTemplate>
        <Link href="/admin"     ><a>Admin   </a></Link>
        <Link href="/weeklies"  ><a>Weeklies</a></Link>
        <Link href="/classes"   ><a>Classes </a></Link>
        <Link href="/rubrics"   ><a>Rubrics </a></Link>
    </AuthenticatedTemplate>
    
    <AuthenticatedTemplate><button onClick={handleSignOut}>Sign Out { accounts && accounts.length > 0 && accounts[0].name}</button></AuthenticatedTemplate>
    <UnauthenticatedTemplate><button onClick={handleSignIn}>Sign In</button></UnauthenticatedTemplate>
   
  </Toolbar>
</AppBar>
    )
}


export default ApplicationBar;