export default async function handler (req, res) {
    
    let revalidated = false;

    try {
        await res.unstable_revalidate('/')
        revalidated = true;
    }
    catch (err) {
        
        console.error(err)
    }
    res.json({revalidated});
}