import {supabase} from '../config/supabase';

export const graphUrl = (ctx) => {
    
    const {key} = ctx 

    switch (key)
    {
        case "getClasses" : return "https://graph.microsoft.com/beta/education/me/classes";
        case "getAssignments" : return `https://graph.microsoft.com/beta/education/me/assignments`;
        case "getAssignment" : return `https://graph.microsoft.com/beta/education/classes/${ctx.classId}/assignments/${ctx.assignmentId}`;
        case "getRubrics" : return `https://graph.microsoft.com/beta/education/me/rubrics`;
        case "getClassMembers" : return `https://graph.microsoft.com/v1.0/education/classes/${ctx.classId}/members/microsoft.graph.delta()`;
        case "getSubmissions" : return `https://graph.microsoft.com/beta/education/classes/${ctx.classId}/assignments/${ctx.assignmentId}/submissions`
        case "getOutcomes" : return `https://graph.microsoft.com/beta/education/classes/${ctx.classId}/assignments/${ctx.assignmentId}/submissions/${ctx.submissionId}/outcomes`
        default: console.error("Unknown key", ctx)
    }
    
};


export const graphContext = {
    getClasses: "https://graph.microsoft.com/beta/$metadata#Collection(educationClass)",
    getAssignments: "https://graph.microsoft.com/beta/$metadata#education/me/assignments",

    getRubrics: "https://graph.microsoft.com/beta/$metadata#education/me/rubrics",
    getSubmissions: "https://graph.microsoft.com/beta/$metadata#education/classes('4908440e-85e7-43c3-a14f-5913246110b4')/assignments('7ac0d899-a669-4aac-8a59-519fda3eb854')/submissions"
}




export const getUrlFromContext = async (ctx) => {

    // console.log("getUrlFromContext", graphUrl(ctx), ctx)
    return  graphUrl(ctx)


    // This code is related to the idea of deltaLinks, but it is unecessary and will be removed!
    // most objects are not supporting deltaLink!
    const {key} = ctx;

    // key => getClasses
    const context = graphContext[key]
    console.log("Using Key", key, context)
    const {data, error} = await supabase
                                    .from("GraphCache")
                                    .select()
                                    .match({context})
                                    .maybeSingle()
  
    error != undefined && console.error(error)
    const url = (data != undefined) ? data.url : graphConfig(ctx)
    console.table("URL From Cache", url)
    return {url, error }
  
  }

export async function callMsGraph(accessToken,  endPoint=graphConfig.graphMeEndpoint, values=[]) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    
    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

   
    // console.log("endPoint", endPoint)

    return fetch(endPoint, options)
        .then(async (response) => {
            
            const reply = await response.json()

            /*
            console.table(
                {
                    context: reply["@odata.context"], 
                    value: reply.hasOwnProperty('value'),
                    nextLink: reply["@odata.nextLink"],
                    deltaLink: reply["@odata.deltaLink"]
                }
                
            )
            */

            if (reply["@odata.deltaLink"] != undefined){
                const {data, error} = await supabase.from("GraphCache").upsert({
                    context:  reply["@odata.context"],
                    url: reply["@odata.deltaLink"]
                });
            }


            if (reply.hasOwnProperty('value') === false) {
                return reply
            }

            values = [...values, ...reply["value"]];

            // console.log("Building Values", values)
            //console.table(values);

        
            if (reply["@odata.nextLink"]){
                return callMsGraph(accessToken, reply["@odata.nextLink"], values)
            } else {
            //    console.log("Last page of data", reply);
                return values;
            }
        
        })
        .catch(error => console.error(error));
}

