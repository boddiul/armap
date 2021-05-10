


const Express = require('express');
const app = Express();
const port = 3000;
const hostname = '127.0.0.1';

const fetch = require('node-fetch');

const QRCode = require('qrcode');

const PDFDocument = require('pdfkit');

const StreamCache = require('stream-cache');

const svg2img = require('svg2img');

const paper = require('paper-jsdom-canvas');

const fs = require('fs');



DrawJS = null;

eval(fs.readFileSync('public/js/scheme.js')+'');

function isNumeric(value) {
    return /^\d+$/.test(value);
}



mapData = {}
qrPDFData = {}
qrHelpData = {}
structureData = {}
/*
mapData[220] = JSON.parse(fs.readFileSync('public/map220.json'));
mapData[22] = JSON.parse(fs.readFileSync('public/map22.json'));
mapData[33] = JSON.parse(fs.readFileSync('public/map33.json'));
mapData[34] = JSON.parse(fs.readFileSync('public/map34.json'));
mapData[35] = JSON.parse(fs.readFileSync('public/map35.json'));
mapData[36] = JSON.parse(fs.readFileSync('public/map36.json'));*/

folderInit = 'public/init/';
folderMain = 'public/maps/';









// Setting up the public directory
app.use(Express.static('public'));

app.use(Express.json());

function getScheme(schemeId, full, res)
{
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


function setScheme(schemeId,schemeData,res) {

    schemeData.id = schemeId;
    mapData[schemeId] = schemeData;

    fs.writeFileSync(folderMain+'map'+schemeId+'.json', JSON.stringify(schemeData));



    if (schemeId in qrPDFData)
        delete qrPDFData[schemeId]
    if (schemeId in qrHelpData)
        delete qrHelpData[schemeId]
    if (schemeId in structureData)
        delete structureData[schemeId]

    if (res!==null)
    {
        res.statusCode = 200;
        res.send(schemeId.toString());
    }

}



app.get('/scheme/:schemeId', (req, res) => {

    getScheme(req.params.schemeId,true,res);


});

app.post('/scheme/', (req, res) => {

    let i = Math.floor(100000*Math.random());

    while (i in mapData)
        i+=1;

    setScheme(i,req.body,res);

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


    res.setHeader('Content-type', 'application/pdf')

    if (schemeId in qrPDFData)
    {
        qrPDFData[schemeId].pipe(res)
    }
    else
    {

        let pdfDoc = new PDFDocument()
        let filename = "qr"+schemeId
        filename = encodeURIComponent(filename) + '.pdf'


        pdfDoc.font('DejaVuSans.ttf');

        pdfDoc.text("SCHEME ID="+schemeId);
        pdfDoc.text("Название: "+mapp['name']);
        pdfDoc.text("Адрес: "+mapp['address']);
        pdfDoc.text("Описание: "+mapp['description']);


        pdfDoc.text('\n')


        ids = []
        for (const f of mapp["floors"]) {
            for (const r of f["rooms"]) {
                for (const q of r["qrs"]) {
                    ids.push({id:parseInt(q.id),room:r.name,floor:f.name})
                }
            }
        }

        ids.sort((a, b) => a["id"] - b["id"]);

        let s = 0;
        for (const code of ids)
        {
            let i = code["id"]

            pdfDoc.text('QR ID='+i)
            pdfDoc.text('Этаж: '+code['floor'])
            pdfDoc.text('Комната: '+code['room'])

            url = 'http://'+hostname+':'+port+'/scheme/'+schemeId+'/qrImage/'+i
            rr = await fetch(url,{encoding: null });
            imageBuffer = await rr.buffer();
            img = Buffer.from(imageBuffer, 'base64');
            pdfDoc.image(img, {width: 250, height: 250});

            s+=1;
            if (s>1 && code!==ids[ids.length-1])
            {
                s=0;
                pdfDoc.addPage();
            }
            else
            {
                pdfDoc.text('\n');
            }

        }
        qrPDFData[schemeId] = new StreamCache();
        pdfDoc.pipe(qrPDFData[schemeId]);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
});
app.get('/scheme/:schemeId/qrHelp/:qrId', (req, res) => {



    let schemeId = req.params.schemeId;
    let qrId = parseInt(req.params.qrId);

    let scheme = null;
    if (schemeId in structureData)
        scheme = structureData[schemeId]
    else
    {
        let j = mapData[schemeId];
        scheme = new Scheme(j);
        structureData[schemeId] = scheme;
    }


    let imageWidth = 600;

    let imageHeight = 500;

    var size = new paper.Size(imageWidth, imageHeight)
    paper.setup(size);


    let currentRoom = null;
    scheme.floors.forEach(function (f) {
        f.rooms.forEach(function (r) {
            r.qrs.forEach(function (q) {
                if (q.id===qrId)
                    currentRoom = r;
            }.bind(this))
        }.bind(this))
    }.bind(this));


    let minX= null;
    let minY = null;
    let maxX = null;
    let maxY = null;

    currentRoom.walls.forEach(function (w) {

        if (minX===null || w.x1<minX)
            minX = w.x1;
        if (maxX===null || w.x1>maxX)
            maxX = w.x1;

        if (minY===null || w.y1<minY)
            minY = w.y1;
        if (maxY===null || w.y1>maxY)
            maxY = w.y1;


    }.bind(this));

    let scaleX = (maxX-minX)/(imageWidth-60);
    let scaleY = (maxY-minY)/(imageHeight-60);

    let scale = (scaleX<scaleY) ? scaleY : scaleX;

    let cx = (maxX+minX)/2;
    let cy = (maxY+minY)/2;




    let drawCoords = function(p) {


        return new paper.Point(imageWidth/2+(p.x-cx)/scale,imageHeight/2-(p.y-cy)/scale)
    }

    currentRoom.furniture.forEach(function (f) {

        let x1 = f.x1;
        let y1 = f.y1;

        let x2 = f.x2;
        let y2 = f.y2;
        let o;

        if (x1>x2)
        {
            o = x1;
            x1 = x2;
            x2 = o;
        }
        if (y1>y2)
        {
            o = y1;
            y1 = y2;
            y2 = o;
        }

        var path = new paper.Path.Rectangle(drawCoords(new paper.Point(f.x1,f.y1)),drawCoords(new paper.Point(f.x2,f.y2)));
        path.strokeColor = '#f1e2e2';
    });




    currentRoom.walls.forEach(function (w) {



        let path = new paper.Path();
        path.strokeColor = 'black';
        path.strokeWidth = 3;
        let start = new paper.Point(w.x1, w.y1);
        let end = new paper.Point(w.x2, w.y2);

        path.moveTo(drawCoords(start));
        path.lineTo(drawCoords(end));

    }.bind(this));



    var path = new paper.Path.Rectangle(new paper.Point(1,1), new paper.Point(imageWidth-1,imageHeight-1))
    path.strokeColor = '#c9c9c9';


    var floorText = new paper.PointText({
        point: new paper.Point(20,20),
        content: currentRoom.floor.name,
        fontSize: 16,
        justification: 'left'
    });

    var roomText = new paper.PointText({
        point: drawCoords(new paper.Point(cx,cy)),
        content: currentRoom.name,
        fontSize: 20,
        justification: 'center'
    });


    currentRoom.floor.doors.forEach(function (d) {



        let oRoom = null;
        if (d.room1 && d.room1.id===currentRoom.id)
        {
            oRoom = d.room2;
        }
        else if (d.room2 && d.room2.id===currentRoom.id)
        {
            oRoom = d.room1;
        }
        if (oRoom!==null)
        {
            let p1 = drawCoords(new paper.Point(d.x1,d.y1));
            let p2 = drawCoords(new paper.Point(d.x2,d.y2));

            let path = new paper.Path();
            path.strokeColor = '#e5b0b0';
            path.strokeWidth = d.width*0.75/scale;

            path.moveTo(p1);
            path.lineTo(p2);

            if (oRoom)
            {
                let dx = (d.x1+d.x2)/2;
                let dy = (d.y1+d.y2)/2;
                let p = drawCoords(new paper.Point(dx,dy));



                t = new paper.PointText({
                    point: p,
                    content: oRoom.name,
                    fontSize: 18,//;(d.y1>minY+0.2 && d.y1<maxY-0.2) ? -90 : 0,
                    justification: 'center',
                    fillColor: '#a16868'
                });

                if (dx<=minX ||dx>=maxX)
                    t.rotate(-90,p)

                if (dx<=minX+0.5)
                    t.point.x-=10;
                if (dx>=maxX-0.5)
                    t.point.x+=15;


                if (dy<=minY+0.5)
                    t.point.y+=15;
                if (dy>=maxY-0.5)
                    t.point.y-=10;
            }

            else
                console.log(d)


        }


    }.bind(this))


    currentRoom.qrs.forEach(function (q) {

        var aa = q.direction*Math.PI/180;
        var xx = q.x - Math.cos(aa)*0.2;
        var yy = q.y - Math.sin(aa)*0.2;


        let col = 'blue';
        if (q.id!==qrId)
            col = '#bdd8e3'



        let pos = drawCoords(new paper.Point(xx,yy))

        t = new paper.PointText({
            point: new paper.Point(pos.x+15,pos.y+15),
            content: q.id,
            fontSize: 20,
            justification: 'left',
            fillColor: col
        });

        var triangle = new paper.Path.RegularPolygon(pos, 3, 20);
        triangle.rotation = -q.direction+90
        triangle.fillColor = col




    }.bind(this))

    var svg = paper.project.exportSVG({asString:true});
    //res.send(svg)

    svg2img(svg, function(error, buffer) {


        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);

    });




});

app.get('/scheme/:schemeId/qrHelpDocument', async(req, res) => {

    schemeId = req.params.schemeId;
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


    res.setHeader('Content-type', 'application/pdf')

    if (schemeId in qrHelpData)
    {
        qrHelpData[schemeId].pipe(res)
    }
    else
    {

        let pdfDoc = new PDFDocument()
        let filename = "qr"+schemeId
        filename = encodeURIComponent(filename) + '.pdf'

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
            pdfDoc.text('\n\nQR ID='+i)

            url = 'http://'+hostname+':'+port+'/scheme/'+schemeId+'/qrHelp/'+i
            rr = await fetch(url,{encoding: null });
            imageBuffer = await rr.buffer();
            img = Buffer.from(imageBuffer, 'base64');
            pdfDoc.image(img, {width: 360, height: 300});
        }
        qrHelpData[schemeId] = new StreamCache();
        pdfDoc.pipe(qrHelpData[schemeId]);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }


});



app.get('/test', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
});



fs.readdir(folderInit, (err, files) => {
    files.forEach(fileName => {
        console.log(fileName);

        let data = JSON.parse(fs.readFileSync(folderInit+fileName))
        setScheme(data.id,data,null);
    });
});



app.listen(port, function ()
{
    console.log("ARMAP app listening at http://%s:%s", hostname, port);

   // console.log("http://127.0.0.1:3000/scheme/220/qrHelp/1");
   // console.log("http://127.0.0.1:3000/scheme/220/qrHelpDocument");
}


);


