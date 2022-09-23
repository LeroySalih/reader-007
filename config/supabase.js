import { createClient} from "@supabase/supabase-js"


const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
const supbaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
console.table({
    supbaseUrl,
    supabaseKey ,
    
});


export const supabase = createClient( supbaseUrl,supabaseKey)

const channel = supabase
  .channel('db-changes')
  .on('postgres_changes', { event: '*', schema: '*' }, (payload) =>
    console.log("CHANGE DETECTED", payload)
  )
  .subscribe()

