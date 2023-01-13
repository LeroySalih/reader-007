import { useState } from "react";

const useTerminalDisplay = () => {

    const [messages, setMessages] = useState([]);

    
   
    const addMessage = (msg) => {

        setMessages(prev => [msg, ...prev]);
    
    }

    const clearMessages = () => {
        setMessages([])
    }

    const Display = () => {
        return <>
            <div className="display">
                { messages.map((m, i) => <div key={i} className="item">{m}</div>)}
            </div>
            
            <style jsx="true">{`
            
                .display {
                    background-color : black;
                    color: #1eff00;
                    height: 500px;
                    overflow-y: scroll;
                    border-radius: 1rem;
                    margin: 1rem;
                    padding: 1rem;
                }
                .item {
                    font-family: "Courier New";
                    font-size: 0.8rem;
                    padding: 0.2rem;

                }
            `}</style>
        </>
    }


    return {addMessage, clearMessages, Display}

}


export default useTerminalDisplay;