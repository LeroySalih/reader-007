
import {Dialog} from "primereact/dialog";
import ClassPickList from "../class-pick-list"; 
import {useState, useEffect,useContext} from "react";
import GfUnitsContext from "../../gf-units-context";
import {Button} from "primereact/button";

const ClassPickDlg = ({ visible, style}) => {

    //const [selectedUnit, setSelectedUnit] = useState(unit);

    const {unitDlg, classDlg} = useContext(GfUnitsContext);
    const {selectedUnit} = unitDlg;
    const {classEditDlgOK, classEditDlgCancel} = classDlg;
    const [currentClasses, setCurrentClasses] = useState([]);

    const handleClassesChanged = (classes) => {
        setCurrentClasses(classes);
        // setSelectedUnit(prev => Object.assign({}, prev, {formativeTitles: formatives}))
    }

    const handleSave = () => {
        classEditDlgOK(selectedUnit, currentClasses)
    }

    const renderFooter = () => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" onClick={classEditDlgCancel} className="p-button-text" />
                <Button label="Close" icon="pi pi-check" onClick={handleSave} autoFocus />
            </div>
        );
    }


    return <>
    <Dialog header={`Classes for ${selectedUnit?.title}`} visible={visible} style={style} footer={renderFooter()} onHide={classEditDlgCancel}>
        <ClassPickList unit={selectedUnit} onClassesChange={handleClassesChanged}/>
        
    </Dialog>
    
    </>
}


export default ClassPickDlg;