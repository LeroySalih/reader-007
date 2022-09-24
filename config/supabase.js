import { createClient} from "@supabase/supabase-js"


const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
const supbaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

/*
console.table({
    supbaseUrl,
    key:  supabaseKey && supabaseKey.length > 0 ? supabaseKey.slice(0, 5) + '...' : 'undefined',
    
});
*/


export const supabase = createClient( supbaseUrl,supabaseKey)

const channel = supabase
  .channel('db-changes')
  .on('postgres_changes', { event: '*', schema: '*' }, (payload) => {}
    // console.log("CHANGE DETECTED", payload)
  )
  .subscribe()

