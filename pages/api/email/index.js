
import { ConstructionRounded } from '@mui/icons-material';
import nodeoutlook from 'nodejs-nodemailer-outlook';
import {supabase} from '../../../config/supabase';

export default async (req, res) => {
    
    if (req.method === 'GET') {
        
        res.status(200).json({ msg: 'Service UP', method: 'GET' })
    }
    
    if (req.method === 'POST') {
        console.log('Body', req.body);
        const {to, subject, htmlBody, textBody} = req.body;
        
        const {data: users, error} = await supabase.from('Users').select();

        error != undefined && console.error("Error", error);

        
        const result = await nodeoutlook.sendEmail({
            auth: {
                user: process.env.NEXT_PUBLIC_EMAIL_USER,
                pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD
            },
            from: process.env.NEXT_PUBLIC_EMAIL_FROM,
            to,
            subject,
            html: htmlBody,
            text: textBody,
            replyTo: process.env.NEXT_PUBLIC_EMAIL_FROM
        });

        res.status(200).json({ msg: 'Service UP', method: 'POST', to });

    }
    
}

