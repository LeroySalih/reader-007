
import {Dialog} from "primereact/dialog";
import GfUnitsContext from "../../gf-units-context";
import {useState, useContext} from 'react';
import {Button} from 'primereact/button'

const NewUnitDlg = ({visible, style}) => {

    const {unitDlg} = useContext(GfUnitsContext);
    const {newUnitDlg, unitNewDlgOK, unitNewDlgCancel,} = unitDlg;

    const renderFooter = () => {
        return (
            <div>
                <pre>{JSON.stringify(visible)}</pre>
                <Button label="Cancel" icon="pi pi-times" onClick={unitNewDlgOK} className="p-button-text" />
                <Button label="Close" icon="pi pi-check" onClick={unitNewDlgCancel} autoFocus />
            </div>
        );
    }

    return <Dialog header={`New Unit`} 
        visible={visible} 
        style={style} 
        footer={renderFooter()} 
        onHide={unitNewDlgCancel}>
    </Dialog>
}


export default NewUnitDlg;