import PDFDocument from 'pdfkit'


const imageDimentions = (score) => {
    return {
        name : (score == '100') ? 'Gold' : 'Silver',
        scoreTextLeft : (score == '100' ? 92 : 100)
    }
}

const buildPDF = (dataCallback, endCallback) => {


    const data = [{name:'Leroy Salih', score: '98'}, {name:'Tim Lawman', score: '100'}, {name:'Lee Marsh', score: '92'}]

    const score = '98'

    const assignmentTitle = 'Unit 3 Vocab Test'

    const doc = new PDFDocument()
    doc.on('data', dataCallback);
    doc.on('end', endCallback)
    doc.text("Some Heading!")
    for (const p of data){
        const image = imageDimentions(p.score)

        doc.addPage({layout: 'landscape'})
        doc.image('./pages/api/reports/CertificateTemplate.png', 12, 15, {fit: [765, 821]})
            .font('./pages/api/reports/Courgette-Regular.ttf')
            .fontSize(52)
            .moveDown(2)
            .text(p.name,  {align: 'center'})
    
        doc
            .image(`./pages/api/reports/${image.name}Ribbon.png`, 15, 340, {fit: [220, 340]})
            .fontSize(30)
            .moveDown(2)
            .text(assignmentTitle,  {align: 'center'})
            .font('Times-Roman')
            .text(`${p.score}%`, image.scoreTextLeft, 410)
    }
    
    doc.end()
}

export default async (req, res) => {

    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition' : 'attachment;filename=text.pdf'
    });

    buildPDF((chuck) => stream.write(chuck), ()=> stream.end());

}