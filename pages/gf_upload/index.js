
import Papa from "papaparse";
import { ProgressBar } from 'primereact/progressbar';
import {supabase} from '../../config/supabase';

import React, { useState, useEffect } from "react";
import useTerminalDisplay from "../../components/terminal-display";
import {Button} from 'primereact/button';
import {FileUpload} from 'primereact/fileupload';
import {Calendar} from 'primereact/calendar';
import {InputText} from 'primereact/inputtext';
import { CompressOutlined } from "@mui/icons-material";
import {DateTime} from 'luxon';
const allowedExtensions = ["csv"];

process.env.NEXT_PUBLIC_DEBUG == "true" ? console.log("USING DEBUG SETTINGS") : console.log("USING PRODUCTION SETTINGS")
const TABLE_NAME = process.env.NEXT_PUBLIC_DEBUG == "true" ? "test.gf_submissions.current" : "gf_submissions.current" 
 
const UploadPage = () => {

    // This state will store the parsed data
    // const [data, setData] = useState([]);
    // const [uploadData, setUploadData] = useState([]);
    // const [uploadDate, setUploadDate] = useState('');

    const [progress, setProgress] = useState(0);
    const [maxProgress, setMaxProgress] = useState(0);

    const [supabaseUser, setSupabaseUser] = useState(null);
    const {addMessage, clearMessages, Display} = useTerminalDisplay();
    // It state will contain the error when
    // correct file extension is not used
    const [error, setError] = useState("");
     
    // It will store the file uploaded by the user
    const [file, setFile] = useState("");
    const [uploadDate, setUploadDate] = useState(null);

    const [fileDate, setFileDate] = useState(null);

    // This function will be called when
    // the file input changes
    
    const handleFileChange = (e) => {
        setError("");
        clearMessages();
        addMessage(`File Date: ${e.target.files[0].name}`);
        
        // reset the upload
        setProgress(0);

        // Check if user has entered the file
        if (e.target.files.length) {
            const inputFile = e.target.files[0];
            // const fName = inputFile.name.split(".")[0]
            
            //const dtUploadDate = DateTime.fromISO(fName)
            // If input type is correct set the state
            setFile(inputFile);
            // const tmpFileDate = new DateTime(calcUploadDate(inputFile.name))
            // setFileDate(dtUploadDate.toISO());
            // checkCount(dtUploadDate.toISO());
        }
    };
    
    const handleParse = async () => {
         
        // If user clicks the parse button without
        // a file we show a error
        if (!file) return addMessage("Enter a valid file");
 
        // Initialize a reader which allows user
        // to read any file or blob.
        const reader = new FileReader();
         
        // Event listener on reader when the file
        // loads, we parse it and set the data.
        reader.onload = async ({ target }) => {
            const csv = Papa.parse(target.result, { header: true });
            const parsedData = csv?.data;
            const columns = Object.keys(parsedData[0]);
            
            // setData(parsedData);

            if (parsedData.length > 0){

                addMessage(`Read ${Object.values(parsedData).length} in Upload File.`)

                const uploadData = processData(file, parsedData);

                // Check the number of items uploaded.
                // checkCount (fileDate);

                // Upload File to Supabase Bucket
                uploadFile(file)
                //setUploadData()
            }

        };

        // calcUploadDate(file.name);
        
        reader.readAsText(file);
    };


    useEffect(() => {
        

        // setFileDate(DateTime.now());

        /* detect auth changes */
        supabase.auth.onAuthStateChange((event, session) => {
            console.log(event, session)
        });

        const login = async () => {

            const { data: { user } } = await supabase.auth.getUser()

            if (!user){

                const { data, error } = await supabase.auth.signInWithOAuth(
                    {
                      provider: 'azure',
                    },
                    {
                      scopes: 'email',
                    }
                  )
            } else {
                setSupabaseUser(user);
            }
            
        }


        login();
        

    }, [])


    /*
    const calcUploadDate = (fName) => {

        
        const parts = fName.split(", ");
        const dt = parts[0].slice( parts[0].length - 10, parts[0].length);
        const time = parts[1].slice( 0, 8);

        const day = dt.slice(0, 2)
        const month = dt.slice(3, 5)
        const year = dt.slice(6, 10)

        const hr = time.slice(0, 2)
        const min = time.slice(3, 5)
        const sec = time.slice(6, 8)

        const dtStr = `${year}-${month}-${day}T${hr}:${min}:${sec}.000Z`

        // return new Date(str).toISODate()
        return new Date(dtStr);

    }
    */

    
    const writeToSupabase = async (updateObj) => {

        // hydrate updateObjects
        const updateObjs = Object.keys(updateObj).map((k, i) => {
            const {formativeTitle, className, pupilName} = JSON.parse(k);
            const score = updateObj[k]

            return {formativeTitle, className, pupilName, score}
        });

        console.log("UpdateObjs", updateObj, updateObjs)
        
        const {data: upsertCheck, error: upsertError} = await supabase
                    .from(`gf_submissions.current`)
                    .upsert(updateObjs);
            
        upsertError && addMessage(`Error ${JSON.stringify(upsertError)} `)
        
        upsertCheck && console.log(JSON.stringify(upsertCheck));
        upsertCheck && addMessage(`Upload to DB Completed]`)
            

    }

    

    

    const processData = (file, data) => {
        
        // const dtFileUploadDate = calcUploadDate(file.name);
        
        addMessage(`Starting Upload for ${uploadDate}`);

        const keys = Object.keys(data);

        const tmpUploadData = []
        
        setProgress(0);
        setMaxProgress(data.length);

        const upsertObject = {}
        
        for (const upload of data){

            if (upload["section"] != "" && upload["section"] != null &&
                upload["student"] != "" && upload["student"] != null
            ) {

                for (var c = 5; c < Object.keys(upload).length; c++){

                    const score = upload[Object.keys(upload)[c]];
    
                    if  (score != '' &&  Object.keys(upload)[c] != '')
                    {
                        
                        // ensure that formativeTitle, className, pupilName are unique
                        upsertObject[
                            JSON.stringify({
                                formativeTitle:Object.keys(upload)[c],
                                className: upload["section"],
                                pupilName: upload["student"]
                            })
                        ] = parseInt(score.slice(0, score.length - 1));
    
                       // console.log(`Adding ${JSON.stringify(Object.keys(upsertObject))}`)
                    } else{
                       // console.log("Skipping", 
                       //     upload["section"], 
                       //     upload["student"], 
                       //     Object.keys(upload)[c] 
                       //     )
                    }
                    
                }
            
            }

            
            
        }

        console.log("Upsert Objects", upsertObject)
        writeToSupabase(upsertObject);

    }

    /* Upload file to Storage */
    const uploadFile = async (file) => {

        console.log("Upload Date", uploadDate);

        const fileName = `/private/${uploadDate.toISOString().substring(0, 10)}.csv`
        console.log(fileName);
        const avatarFile = file
        const { data: fileData, error: fileError } = await supabase
        .storage
        .from('data-files')
        .upload(fileName, 
        file, 
        {
            cacheControl: '3600',
            upsert: true
        });

        fileError && console.error(fileError);
        !fileError && console.log("File Uploaded", fileData);
        !fileError && addMessage(`File Uploaded ${fileData.path}` )

    }


    

    return <div>
    <div>
        <div className="card">
            <div>
                <Calendar onChange={(e) => setUploadDate(e.value)}/>
            </div>
            <div>
                {JSON.stringify(uploadDate)}
            </div>
            <div>
                <div>FileDate: {JSON.stringify(fileDate, null, 2)}</div>
                

            </div>
            <div className="card-title">Enter CSV File</div>    
            
            <input
                onChange={handleFileChange}
                id="csvInput"
                name="file"
                type="File"
            />
    
            <Button onClick={handleParse}>Parse</Button>

            <div>
                <ProgressBar value={(progress / maxProgress) * 100} />
            </div>

            <div>
                <Display />
            </div>
        </div>
    </div>
    <style >{`
    
        .card {
            width: 80%;
            margin: auto;
            background-color: white;
            padding: 1rem;
            margin: 2rem;
            border: silver 1px solid;
            border-radius: 1rem;
            box-shadow: 0px 5px 20px #a0a0a0;
        }

        .card-title {

        }
    
    `}</style>
</div>
    
}

export default UploadPage;