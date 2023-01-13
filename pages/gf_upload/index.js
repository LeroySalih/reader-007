
import Papa from "papaparse";
import { ProgressBar } from 'primereact/progressbar';
import {supabase} from '../../config/supabase';

import React, { useState, useEffect } from "react";
import useTerminalDisplay from "../../components/terminal-display";

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

    // This function will be called when
    // the file input changes
    
    const handleFileChange = (e) => {
        setError("");
        clearMessages();
        
         // reset the upload
         setProgress(0);

        // Check if user has entered the file
        if (e.target.files.length) {
            const inputFile = e.target.files[0];
             
            // Check the file extensions, if it not
            // included in the allowed extensions
            // we show the error
            const fileExtension = inputFile?.type.split("/")[1];
            if (!allowedExtensions.includes(fileExtension)) {
                setError("Please input a csv file");
                return;
            }
 
            // If input type is correct set the state
            setFile(inputFile);
            checkCount(calcUploadDate(inputFile.name));
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
                checkCount (calcUploadDate(file.name));

                // Upload File to Supabase Bucket
                uploadFile(file)
                //setUploadData()
            }

        };

        // calcUploadDate(file.name);
        
        reader.readAsText(file);
    };


    useEffect(() => {
        
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

    const writeToSupabase = async (updateObj) => {

        const {data, error} = await supabase.from(TABLE_NAME)
                                      .select()
                                      .eq("formativeTitle", updateObj["formativeTitle"])
                                      .eq("className", updateObj["className"])
                                      .eq("pupilName", updateObj["pupilName"])
                                      .eq("score", updateObj["score"])

        error && console.error("Error", error);

        // query was successful, but no rows were returned, 
        // so we will update the db.
        if (data && data.length === 0) {
            //console.log("updateObj", updateObj)
            const {data: upsertCheck, error: upsertError} = await supabase.from(TABLE_NAME).upsert(updateObj)
            upsertError && console.error(upsertError);
            console.log(`Added ${updateObj["pupilName"]}`)
            addMessage(`Added ${updateObj["pupilName"]}`)
        } else {
            addMessage(`Skipping ${updateObj["pupilName"]}`)
        }

    }

    

    const checkCount = async (dtFileUploadDate) => {
        const {data, error} = await supabase.from(TABLE_NAME)
                                        .select()
                                        .eq("uploadDate", dtFileUploadDate.toISOString())
                                        
        error && console.error("Error", error);

        
        addMessage(`${data?.length} for this ${dtFileUploadDate.toISOString()}`)
        console.log(data) 
    }

    const processData = (file, data) => {
        
        

        const dtFileUploadDate = calcUploadDate(file.name);
        
        addMessage(`Starting Upload for ${dtFileUploadDate}`);

        const keys = Object.keys(data);

        const tmpUploadData = []
        
        setProgress(0);
        setMaxProgress(data.length);
        
        for (const upload of data){
            for (var c = 5; c < Object.keys(upload).length; c++){

                const score = upload[Object.keys(upload)[c]];

                if (score != '' && upload["section"] != '' && upload["student"] != '' && Object.keys(upload)[c] != ''){
                    const uploadObject = {
                        formativeTitle : Object.keys(upload)[c], 
                        className : upload["section"],
                        pupilName : upload["student"],
                        score: score.slice(0, score.length - 1),
                        uploadDate: dtFileUploadDate
                    };

                    writeToSupabase(uploadObject);

                }

                
                
            }

            setProgress(prev => ++prev)
            
        }


    }

    const uploadFile = async (file) => {

        const avatarFile = file
        const { data: fileData, error: fileError } = await supabase
        .storage
        .from('data-files')
        .upload(`/private/${calcUploadDate(file.name).toISOString()}.csv`, avatarFile, {
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
            
            <div className="card-title">Enter CSV File</div>    
            
            <input
                onChange={handleFileChange}
                id="csvInput"
                name="file"
                type="File"
            />
    
            <button onClick={handleParse}>Parse</button>
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