
import { setRevalidateHeaders } from 'next/dist/server/send-payload'
import { useRouter } from 'next/router'
import { supabase }  from "../../../config/supabase"
import { useState, useEffect} from 'react'


const Classes = {
    "maths" : ['7Ma1', '7Ma2', '7Ma3', '7Ma4'],
    "science" : ['']
}


const CurrentView = () => {

    const router = useRouter()
    const { params } = router.query
    const [data, setData] = useState(null);
    

    const getData = async () => {

        if (params == undefined)
        {
            return 
        }

        const {data, error} = await supabase
                                    .from("gf_Submissions")
                                    .select()
                                    .eq('className', '7Ma1');

        error != undefined && console.error(error);

       if (data != undefined){
            data = data
                .sort((a, b) => a.className > b.className ? 1 : -1)
                .filter(a => a.className.includes('7') )
                // .filter(a => Classes[params[0]].includes(a.className ))
            
            
            setData (data);
        }
        

        
        
    }

    useEffect(() => {
        getData();
    }, [data, params])



    return <>
        <h1>Current View {JSON.stringify(params) }</h1>
        {data && data.map(((p, i) => <div key={i}>{p.pupilName}, {p.className}, {p.formativeTitle}</div>))}
        
        <pre>{JSON.stringify(data, null, 2)}</pre></>
}

export default CurrentView