import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {dueWeekFromISO, workWeekFromISO} from '../libs/spacetime';
import Button from '@mui/material/Button'
export default function Home() {

  const handleSendMail = async () => {
    
    const response = await fetch('/api/email', {
        method: 'POST',
        headers : {
          'Content-Type' : 'application/json'
        },      
        body : JSON.stringify({
          to: 'leroysalih@bisak.org', 
          subject: 'No Homework', 
          textBody: 'This is the text of the body',
          htmlBody: 'This is the <u>text</u> of the body'
        })
      })
      
    const data = await response.json()
    
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>BISAK-BaC Dept</title>
        <meta name="description" content="Business and Computing Dept" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
            <p>Welcome to </p>
            <p><a href="https://BISAK.org">BISAK</a></p> 
            <p>Business and Computing Dept</p>
            
        </h1>
        <Button onClick={handleSendMail}>Send Mail</Button>

        
       
      </main>

      <footer className={styles.footer}>
        {JSON.stringify(
            {
              clientID: process.env.NEXT_PUBLIC_CLIENT_ID,
              redirectUrl: process.env.NEXT_PUBLIC_REDIRECT_URL,
              supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
              supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY
            }
            )}
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
