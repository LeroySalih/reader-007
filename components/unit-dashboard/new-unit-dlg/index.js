
import {Dialog} from "primereact/dialog";
import GfUnitsContext from "../../gf-units-context";
import {useState, useContext} from 'react';
import {Button} from 'primereact/button'
import { setNestedObjectValues, useFormik } from 'formik';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

const NewUnitDlg = ({visible, style}) => {

    const {unitDlg} = useContext(GfUnitsContext);
    const {newUnitDlg, unitNewDlgOK, unitNewDlgCancel,} = unitDlg;
    const [formData, setFormData] = useState({
        title: '',
        subject: ''
    });

    const renderFooter = () => {
        return (
            <div>
               
                <Button label="Cancel"  icon="pi pi-times" onClick={unitNewDlgCancel} className="p-button-text" />
                <Button label="Close" disabled={isValid() === false} icon="pi pi-check" onClick={handleSave} autoFocus />
            </div>
        );
    }

    const handleSave = () => {
        unitNewDlgOK(formData)
    }

    const handleCancel = () => {
        unitNewDlgCancel()
    }

    const handleChange = (e) => {
        
        const updateObj =  Object.assign({}, formData, {[e.target.name]: e.target.value})
        setFormData(updateObj);

    }

    const isValid = () => {
        return  formData.title.length > 0 && formData.subject.length > 0
    }

    return <>

    
    
    <Dialog header={`New Unit`} 
        visible={visible} 
        style={style} 
        footer={renderFooter()} 
        onHide={unitNewDlgCancel}>

            
            <div className="field">
                
                    <InputText 
                        id="title" 
                        name="title" 
                        style={{width: "80%"}}
                        value={formData.title} 
                        onChange={handleChange} 
                        autoFocus 
                        placeholder="New Unit Name"
                        />
                    
                
            
            </div>
            <div className="field">
                
                    <InputText 
                        id="subject" 
                        name="subject" 
                        style={{width: "80%"}}
                        value={formData.subject} 
                        onChange={handleChange} 
                        autoFocus 
                        placeholder="Subject"
                        
                        />
                    
                
            
            </div>
            
      
    </Dialog>

    <style jsx="true">{`

        .field {
            margin: 1rem;
            width: 100%;
            display: flex;
            justify-content: center;
        }
    `}
    </style>

    </>
    
}


export default NewUnitDlg;