import { getUrlFromContext, callMsGraph } from "./callMsGraph";

export const fetchData = async (instance, account, loginRequest, context)  => {

    const request = {
        ...loginRequest,
        account 
    };


    const url = await getUrlFromContext(context)
    console.log("URL From Context is:", url)
  
    
    // Load Classes Data
    try{
      const token = await instance.acquireTokenSilent(request);
      const replyData = await callMsGraph(token.accessToken, url);
      return (replyData)
      // return (onlyMyClasses(replyData))
    } 
    catch(e) {
      console.error(e)
      const token = await instance.acquireTokenRedirect(request);
      const replyData = await callMsGraph(token.accessToken, url);

      return (replyData)
      // return (onlyMyClasses(replyData))
    }
  
}