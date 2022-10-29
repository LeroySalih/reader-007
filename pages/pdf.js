import {Document, Page, View, Text, PDFViewer, Image, StyleSheet} from '@react-pdf/renderer';
import { useEffect, useState } from 'react';

const PDF = () => {
    return (<Document>
        <Page>
            <View>
                <Text>This is the text</Text>
            </View>
        </Page>
    </Document>)
}


const PDFView = () => {
    const [client, setClient] = useState(false);

    useEffect(()=> {
        setClient(true);
    }, [client])
    return (
        <PDFViewer>
            <PDF/>
        </PDFViewer>
    )
}


export default PDFView;