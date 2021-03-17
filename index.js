const Express = require('express');
const app = Express();
const port = 3000;
const hostname = '127.0.0.1';

const fetch = require('node-fetch');

const QRCode = require('qrcode');

const PDFDocument = require('pdfkit');

const MongoClient = require('mongodb').MongoClient;

const fs = require('fs');

function isNumeric(value) {
    return /^\d+$/.test(value);
}



mapData = {}
mapData[220] = JSON.parse(fs.readFileSync('public/map220.json'));
mapData[22] = JSON.parse(fs.readFileSync('public/map22.json'));
mapData[33] = JSON.parse(fs.readFileSync('public/map33.json'));
mapData[34] = JSON.parse(fs.readFileSync('public/map34.json'));
mapData[35] = JSON.parse(fs.readFileSync('public/map35.json'));
mapData[36] = JSON.parse(fs.readFileSync('public/map36.json'));






// Setting up the public directory
app.use(Express.static('public'));


function getScheme(req,res,full)
{
    schemeId = req.params.schemeId
    if (isNumeric(schemeId))
    {
        if (schemeId in mapData)
        {
            mapp = mapData[schemeId]

            if (!full)
                mapp = (({ id, name,description,address }) => ({ id, name,description,address }))(mapp)

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(mapp));
        }
        else
            res.status(404).send('Scheme not found')
    }
    else
        res.status(404).send('Invalid ID supplied')
}

app.get('/scheme/:schemeId', (req, res) => {
    getScheme(req,res,true)

});

app.get('/scheme/:schemeId/info', (req, res) => {
    getScheme(req,res,false)

});

app.get('/scheme/:schemeId/qrImage/:qrId', (req, res) => {
    schemeId = req.params.schemeId
    qrId = req.params.qrId
    //txt = "https://armap.boddiul.com/
    txt = "arindoorapp://"

    txt+=("?schemeid="+schemeId+"&qrid="+qrId);


    QRCode.toDataURL(txt,  { errorCorrectionLevel: 'L' },function (err, url) {
        const im = url.split(',')[1];
        const img = Buffer.from(im, 'base64');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', img.length);
        res.end(img);
    })

});



app.get('/scheme/:schemeId/qrImageDocument', async (req, res) =>  {


    schemeId = req.params.schemeId

    schemeId = req.params.schemeId
    if (isNumeric(schemeId))
    {
        if (schemeId in mapData)
        {
            mapp = mapData[schemeId]

        }
        else
        {
            res.status(404).send('Scheme not found')
            return;
        }

    }
    else
    {
        res.status(404).send('Invalid ID supplied')
        return;
    }







    let pdfDoc = new PDFDocument()
    let filename = "qr"+schemeId
    filename = encodeURIComponent(filename) + '.pdf'




    res.setHeader('Content-type', 'application/pdf')

    pdfDoc.text("SCHEME ID="+schemeId);



    pdfDoc.text('\n')


    ids = []
    for (const f of mapp["floors"]) {
        for (const r of f["rooms"]) {
            for (const q of r["qrs"]) {
                ids.push(parseInt(q.id))
            }
        }
    }

    ids.sort((a, b) => a - b);

    for (const i of ids)
    {
        pdfDoc.text('\n\n\n\n QR ID='+i)

        url = 'http://'+hostname+':'+port+'/scheme/'+schemeId+'/qrImage/'+i
        rr = await fetch(url,{encoding: null });
        imageBuffer = await rr.buffer();
        img = Buffer.from(imageBuffer, 'base64');
        pdfDoc.image(img, {width: 150, height: 150});
    }


    pdfDoc.pipe(res);
    pdfDoc.end();

});


app.get('/test', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
});


app.listen(port, function ()
{
    console.log("ARMAP app listening at http://%s:%s", hostname, port);

}


);


