import { PublicClientApplication } from "@azure/msal-browser";


export const DeptClasses = [
    "7A_It1",
    "7B_It1",
    "7C_It1",
    "8A_It1",
    "8B_It1",
    "8C_It1",
    "9C_It1",
    "9A_It1",
    "9B_It1",
    "9C_It1",
    "10BS1",
    "10BS2",
    "10CS",
    "10EC",
    "10IT",
    "11BS1",
    "11BS2",
    "11CS",
    "11EC",
    "11IT",
    "12BS",
    "13BS" 
  ]


export const msalConfig = {
    auth: {
      // clientId: "ec01aecc-f878-4a74-b606-49cedd47990c",
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      authority: "https://login.microsoftonline.com/organizations", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
      redirectUri: process.env.NEXT_PUBIC_REDIRECT_URL,
    },
    cache: {
      cacheLocation: "sessionStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
  };
  
  // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
  export const loginRequest = {
   scopes: ["User.Read", "EduRoster.ReadBasic"]
  };

  export const msalInstance = new PublicClientApplication(msalConfig);
  
  // Add the endpoints here for Microsoft Graph API services you'd like to use.
  
  /*
  export const graphConfig = {
      graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
      graphMyClassesEndpoint: "https://graph.microsoft.com/beta/education/classes",
      graphClassAssignments: (cId) => `https://graph.microsoft.com/beta/education/me/assignments`
  };
  */


/*
const channel = supabase
  .channel('db-changes')
  .on('postgres_changes', { event: '*', schema: '*' }, (payload) =>
    console.log("CHANGE DETECTED", payload)
  )
  .subscribe()
*/


