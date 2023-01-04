import * as React from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import spacetime from 'spacetime';
import {dueWeek, dueWeekFromISO} from '../../libs/spacetime';

import Link from 'next/link'

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { DateTime } from 'luxon';



const ApplicationBar = () => {

    const {instance, accounts} = useMsal();

    const handleSignOut = () => {
        instance.logoutRedirect().catch(e => console.log(e))
    }

    const handleSignIn = () => {
        instance.loginRedirect().catch(e => console.error(e))
    }

    const adminMenuOptions = [
        {label: 'Admin', href: '/admin'},
       // {label: 'Submissions', href: '/admin-submissions'},
       // {label: 'Outcomes', href: '/admin-outcomes'}
    ]

    const reportsMenuOptions = [
        {label: 'Assignments', href: '/assignments'},
        {label: 'Scheme of Work', href: '/sows'},
        {label: 'Weeklies', href: '/weeklies'},
        {label: 'Rubrics', href: '/rubrics'},
        {label: `No Work Submitted for ${dueWeekFromISO("2022-10-11").toISODate()}`, href : `/no_work_submitted/${dueWeekFromISO("2022-10-11").toISODate()}`},
    ]

    const formativesMenuOptions = [
      {label: 'Upload', href: '/gf_upload'},
      {label: 'Last Updated', href: '/gf_last_updated'},
      {label: 'Units', href: '/gf_units'},
      
  ]


    return (<>
        <AppBar position="static">
  <Toolbar variant="dense">
    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
      <MenuIcon />
    </IconButton>
    
    <div className="nav-bar-layout">
        <div >
        
        <AuthenticatedTemplate>
            <div style={{"display": "flex", "flexDirection" : "row"}}>
            <Link href="/"><Button color="neutral" label={'Admin'} >Home</Button></Link>
            <BasicMenu label={'Admin'} options={adminMenuOptions}/>
            <BasicMenu label={'Reports'} options={reportsMenuOptions}/>
            <BasicMenu label={'Formatives'} options={formativesMenuOptions}/>
            </div>
        </AuthenticatedTemplate>
    </div>
    <AuthenticatedTemplate><button onClick={handleSignOut}>Sign Out { accounts && accounts.length > 0 && accounts[0].name}</button></AuthenticatedTemplate>
    <UnauthenticatedTemplate><Link href="/"><a>Home</a></Link><button onClick={handleSignIn}>Sign In</button></UnauthenticatedTemplate>
    </div>
  </Toolbar>
</AppBar>
        <style jsx="true">
                {`
                    .nav-bar-layout {
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                    }
                    a {
                        margin-left : 1rem;
                    }
                `}
        </style>
</>
    )
}


export default ApplicationBar;




function BasicMenu({label, options}) {

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <div>
      <Button
        color="neutral"
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {label}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {
            options.map((o, i) => 
                <MenuItem key={i} onClick={handleClose}>
                    <Link href={o.href}>
                        <span>{o.label}</span>
                    </Link>
                </MenuItem>        
            )
        }
      </Menu>
    </div>
  );
}
