
import {Dialog} from "primereact/dialog";
import FormativePickList from "../formative-pick-list"; 
import {useState, useEffect,useContext} from "react";
import GfUnitsContext from "../../gf-units-context";
import {Button} from "primereact/button";

const FormativePickDlg = ({ visible, style}) => {

    //const [selectedUnit, setSelectedUnit] = useState(unit);

    const {unitDlg, formativeDlg} = useContext(GfUnitsContext);
    const {selectedUnit, selectUnit} = unitDlg;
    const {formativeEditDlgOK, formativeEditDlgCancel} = formativeDlg;
    const [currentFormatives, setCurrentFormatives] = useState([]);

    const handleFormativesChanged = (formatives) => {
        setCurrentFormatives(formatives);
        // setSelectedUnit(prev => Object.assign({}, prev, {formativeTitles: formatives}))
    }

    const handleSave = () => {
        formativeEditDlgOK(selectedUnit, currentFormatives)
    }

    const renderFooter = () => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" onClick={formativeEditDlgCancel} className="p-button-text" />
                <Button label="Close" icon="pi pi-check" onClick={handleSave} autoFocus />
            </div>
        );
    }


    return <>
    <Dialog header={`Formatives for ${selectedUnit?.title}`} visible={visible} style={style} footer={renderFooter()} onHide={formativeEditDlgCancel}>
        <FormativePickList unit={selectedUnit} onFormativesChanged={handleFormativesChanged}/>
        
    </Dialog>
    
    </>
}


export default FormativePickDlg;