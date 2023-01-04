
import Papa from "papaparse";
import { ProgressBar } from 'primereact/progressbar';
import {supabase} from '../../config/supabase';

import React, { useState, useEffect } from "react";
const allowedExtensions = ["csv"];


const TABLE_NAME = "gf_submissions.current"

const UploadPage = () => {

    // This state will store the parsed data
    const [data, setData] = useState([]);
    const [uploadData, setUploadData] = useState([]);
    const [uploadDate, setUploadDate] = useState('');

    const [progress, setProgress] = useState(0);
    const [maxProgress, setMaxProgress] = useState(0);

    const [supabaseUser, setSupabaseUser] = useState(null);

    // It state will contain the error when
    // correct file extension is not used
    const [error, setError] = useState("");
     
    // It will store the file uploaded by the user
    const [file, setFile] = useState("");

    // This function will be called when
    // the file input changes
    const handleFileChange = (e) => {
        setError("");
         
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
        }
    };

    const handleParse = () => {
         
        // If user clicks the parse button without
        // a file we show a error
        if (!file) return setError("Enter a valid file");
 
        // Initialize a reader which allows user
        // to read any file or blob.
        const reader = new FileReader();
         
        // Event listener on reader when the file
        // loads, we parse it and set the data.
        reader.onload = async ({ target }) => {
            const csv = Papa.parse(target.result, { header: true });
            const parsedData = csv?.data;
            const columns = Object.keys(parsedData[0]);
            setData(parsedData);
        };
        calcUploadDate();
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

    useEffect( ()=> {
        if (data.length > 0){
            setUploadData(generateUploadData(data))
        }
    }, [data]);

    async function signInWithAzure() {
        
      }

    const calcUploadDate = () => {

        const {name: fName} = file;
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

        if (data && data.length === 0) {
            //console.log("updateObj", updateObj)
            const {data: upsertCheck, error: upsertError} = await supabase.from(TABLE_NAME).upsert(updateObj)
            upsertError && console.error(upsertError);
        } else {
            // console.log("Skipping", updateObj)
        }

        
        

        


    }

    

    const checkCount = async (dtFileUploadDate) => {
        const {data, error} = await supabase.from(TABLE_NAME)
                                        .select()
                                        .eq("uploadDate", dtFileUploadDate.toISOString())
                                        
        error && console.error("Error", error);

        console.log(data?.length, "items added")
        console.log(data) 
    }



    const generateUploadData = () => {
        
        const dtFileUploadDate = calcUploadDate();

        const keys = Object.keys(data);

        const tmpUploadData = []

        setProgress(0);
        setMaxProgress(data.length)

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

        checkCount (dtFileUploadDate);

        uploadFile()

    }

    const uploadFile = async () => {

        const avatarFile = file
        const { data: fileData, error: fileError } = await supabase
        .storage
        .from('data_files')
        .upload(file.name, avatarFile, {
            cacheControl: '3600',
            upsert: false
        });

        fileError && console.error(fileError);
        !fileError && console.log("File Uploaded", fileData);

    }

    return <div>
    <label htmlFor="csvInput" style={{ display: "block" }}>
        Enter CSV File
    </label>
    <input
        onChange={handleFileChange}
        id="csvInput"
        name="file"
        type="File"
    />
    <div>
        <button onClick={handleParse}>Parse</button>
    </div>
    <div>
        <ProgressBar value={(progress / maxProgress) * 100} />
    </div>
    <div>
        <button onClick={uploadFile}>Upload File</button>
    </div>
    <div>
        <button onClick={signInWithAzure}>Login </button>
    </div>
    <pre>{JSON.stringify(supabaseUser, null, 2)}</pre>
</div>
    
}

export default UploadPage;