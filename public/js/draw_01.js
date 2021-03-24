

typeLayers = {}
types = ["rooms","doors","elevators","staircases","qrs","nodes","edges","furniture"]
types.forEach(function (t) {
    typeLayers[t] = []
    typeLayers[t+"Data"] = []
})


function setVisibleLayer(layer,visible)
{
    typeLayers[layer].forEach(function (o) {
        o.visible = visible;
    })
}


k = 60;

function coordsToEditor(x,y,floor) {

    var hy = 15;

    var hOffset = floor*14*k;
    var vOffset = floor*3*k;


    res = [hOffset+x*k, vOffset+k*hy-y*k]


    return res;
}


mainGroup = new Group();



mainGroup = null


function drawInit()
{

    if (mainGroup!=null)
        mainGroup.removeChildren();


    mainGroup = new Group();

    mainGroupStartOffset = null;


    for (var l=-50;l<50;l++)
    {
        line = new Path();
        line.moveTo([l*k,-5000]);
        line.lineTo([l*k,5000]);


        col = '#d8effa'
        line.strokeColor = col;

        mainGroup.addChild(line);

        line = new Path();
        line.moveTo([-5000,l*k]);
        line.lineTo([5000,l*k]);

        line.strokeColor = col;

        mainGroup.addChild(line);

    }



    floors.forEach(function (f) {

        txy = coordsToEditor(0.5,0.5,f.editorHpos)

        t = new PointText({
            point: new Point(txy[0],txy[1]),
            content: f.name,
            fontSize: 15,
            justification: 'left'
        });
        mainGroup.addChild(t)
    })

    for (var ii=0;ii<rooms.length;ii++)
    {


        r = rooms[ii];



        /*
        console.log(r.dummy_walls)

        var xy1 =  coordsToEditor(r.dummy_walls[0],r.dummy_walls[1],r.floor.editorHpos);
        var xy2 =  coordsToEditor(r.dummy_walls[2],r.dummy_walls[3],r.floor.editorHpos);

        console.log(xy1,xy2)

        start = new Point(xy1);
        end = new Point(xy2);
        rectangle = new Rectangle(start, end);
        var path = new Path.Rectangle(rectangle);

        typeLayers["rooms"].push(path);

        path.strokeColor = 'black';



        */

        p = new Path();

        end = null
        p.strokeColor = 'black';
        r.walls.forEach(function (w) {
            var xy1 =  coordsToEditor(w.x1,w.y1,r.floor.editorHpos);
            var xy2 =  coordsToEditor(w.x2,w.y2,r.floor.editorHpos);

            start = new Point(xy1);
            end = new Point(xy2);


            p.moveTo(start);
            p.lineTo(end)


        })


        mainGroup.addChild(p);
        typeLayers["rooms"].push(p);

        t = new PointText({
            point: end+new Point(4,15),
            content: r.id+' '+r.name,
            fontSize: 14,
            justification: 'left'
        });

        mainGroup.addChild(t)


        typeLayers["roomsData"].push(t);




        r.furniture.forEach(function (f) {

            var xy1 =  coordsToEditor(f.x1,f.y1,r.floor.editorHpos);
            var xy2 =  coordsToEditor(f.x2,f.y2,r.floor.editorHpos);

            console.log(xy1,xy2)

            start = new Point(xy1);
            end = new Point(xy2);
            rectangle = new Rectangle(start, end);
            var path = new Path.Rectangle(rectangle);

            path.strokeColor = 'grey';


            mainGroup.addChild(path);
            typeLayers["furniture"].push(path);


            t = new PointText({
                point: start+new Point(4,10),
                content: f.name,
                fontSize: 10,
                justification: 'left'
            });

            mainGroup.addChild(t)


            typeLayers["furnitureData"].push(t);
        })












        /*
        p = new Path;
        p.strokeColor = 'green';

        p.moveTo(start);
        p.lineTo(xy2)

         */




    }

    elevators.forEach(function (e) {


        aa = e.direction/180*Math.PI
        coords = [[0,0.5],[1,0.5],[1,-0.5],[0,-0.5]]

        for (i=0;i<4;i+=1)
        {
            coords[i] = [e.x+coords[i][0]*Math.cos(aa)-coords[i][1]*Math.sin(aa),e.y+coords[i][0]*Math.sin(aa)+coords[i][1]*Math.cos(aa)];
        }

        coords.push(coords[0])
        coords.push(coords[2])
        coords.push(coords[1])
        coords.push(coords[3])


        var p = new Path();



        p.strokeColor = 'green';

        for (i=0;i<4+3;i+=1)
        {
            xy = coordsToEditor(coords[i][0],coords[i][1],e.room.floor.editorHpos)
            xy2 = coordsToEditor(coords[i+1][0],coords[i+1][1],e.room.floor.editorHpos)

            p.moveTo(xy)
            p.lineTo(xy2)
        }


        mainGroup.addChild(p)
        typeLayers["elevators"].push(p);


    })


    staircases.forEach(function (s) {
        aa = s.direction/180*Math.PI
        coords = [[0,s.width/2],[s.height,s.width/2],[s.height,-s.width/2],[0,-s.width/2]]
        coords.push(coords[0])

        for (i=0;i<5;i+=1)
        {
            coords.push([i/5*s.height,-s.width/2])
            coords.push([i/5*s.height,s.width/2])
            coords.push([(i+0.5)/5*s.height,s.width/2])
            coords.push([(i+0.5)/5*s.height,-s.width/2])
        }


        for (i=0;i<coords.length;i+=1)
        {
            coords[i] = [s.x+coords[i][0]*Math.cos(aa)-coords[i][1]*Math.sin(aa),s.y+coords[i][0]*Math.sin(aa)+coords[i][1]*Math.cos(aa)];
        }







        var p = new Path();

        p.strokeColor = 'green';

        for (i=0;i<coords.length-1;i+=1)
        {
            xy = coordsToEditor(coords[i][0],coords[i][1],s.room.floor.editorHpos)
            xy2 = coordsToEditor(coords[i+1][0],coords[i+1][1],s.room.floor.editorHpos)

            p.moveTo(xy)
            p.lineTo(xy2)
        }


        mainGroup.addChild(p)
        typeLayers["staircases"].push(p);

    })


    for (var dd=0;dd<doors.length;dd++)
    {



        d = doors[dd]


        xx = (d.x1+d.x2)/2;
        yy = (d.y1+d.y2)/2;



        console.log(d.floor.editorHpos);
        xy = coordsToEditor(xx,yy,d.floor.editorHpos)



        t = new PointText({
            point: new Point(xy[0],xy[1]),
            content: d.id+' {'+(d.room1 ? d.room1.id:'_') +','+d.room2.id+'}',
            fontSize: 10,
            justification: 'left',
            fillColor: 'brown'
        });


        mainGroup.addChild(t)



        var ndoor = new Path.RegularPolygon(coordsToEditor(xx,yy,d.floor.editorHpos), 4, 5);
        ndoor.scale(1,5);
        ndoor.rotation = d.direction/Math.PI*180;
        //console.log(ndoor)
        ndoor.fillColor = 'brown'
        mainGroup.addChild(ndoor)


        typeLayers["doorsData"].push(t);
        typeLayers["doors"].push(ndoor);

    }

    qrs.forEach(function (q) {

        //console.log(q)
        var aa = q.direction*Math.PI/180;
        var xx = q.x - Math.cos(aa)*0.15;
        var yy = q.y - Math.sin(aa)*0.15;


        txy = coordsToEditor(xx,yy,q.room.floor.editorHpos)

        t = new PointText({
            point: new Point(txy[0]+7,txy[1]+8),
            content: q.id+' ('+q.direction+'*)',
            fontSize: 10,
            justification: 'left',
            fillColor: 'blue'
        });
        mainGroup.addChild(t)
        typeLayers["qrsData"].push(t);

        var triangle = new Path.RegularPolygon(coordsToEditor(xx,yy,q.room.floor.editorHpos), 3, 10);
        triangle.rotation = -q.direction+90
        triangle.fillColor = 'blue'

        mainGroup.addChild(triangle)

        typeLayers["qrs"].push(triangle);
    })




    for (var ii=0;ii<edges.length;ii++)
    {
        e = edges[ii]



        // console.log(e)

        var p = new Path();

        p.strokeColor = 'red';
        if (e.node1.floor!==e.node2.floor)
        {


            p.strokeColor = '#ff7ada';

        }



        var xy1 = coordsToEditor(e.node1.x,e.node1.y,e.node1.floor.editorHpos);

        var xy2 = coordsToEditor(e.node2.x,e.node2.y,e.node2.floor.editorHpos);

        start = new Point(xy1);
        p.moveTo(start);
        p.lineTo(xy2)


        mainGroup.addChild(p)

        typeLayers["edges"].push(p);




        t = new PointText({
            point: new Point((xy1[0]+xy2[0])/2,(xy1[1]+xy2[1])/2)+new Point(4,-3),
            content: e.weight.toFixed(1),
            fontSize: 12,
            fontSize: 12,
            justification: 'left',
            fillColor:'red'
        });

        mainGroup.addChild(t)
        typeLayers["edgesData"].push(t);




    }


    for (var ii=0;ii<nodes.length;ii++) {

        n = nodes[ii]

        xy = coordsToEditor(n.x,n.y,n.floor.editorHpos);





        c = new Path.Circle({
            center: xy,
            radius: n.obj_type==="in_room" ? 6 : 3,
            fillColor: '#ff0000'
        });


        mainGroup.addChild(c)

        typeLayers["nodes"].push(c);


        t = new PointText({
            point: new Point(xy)+new Point(4,-3),
            content: n.id+(n.obj_type==="in_room" ? " {"+n.obj_id+"}" : ""),
            fontSize: 15,
            justification: 'left',
            fillColor:'red'
        });

        mainGroup.addChild(t)

        typeLayers["nodesData"].push(t);



    }





    types.forEach(function (t) {
        onEditorLayerBox(t,false)
        onEditorLayerBox(t,true)

    })

}


function onMouseDown(event) {
    mainGroupStartOffset = mainGroup.position;
    mouseStartOffset = new Point(event.event.x,event.event.y);

}

function onMouseDrag(event) {
    // console.log(event);
    curr = new Point(event.event.x,event.event.y);
    mainGroup.position = mainGroupStartOffset+curr-mouseStartOffset;
}

function onScroll(event)
{
    console.log(event);


    hh = 1 - event.deltaY/1000;

    mainGroup.children.forEach(function (c) {

        c.position.x = hh*c.position.x;
        c.position.y = hh*c.position.y;


        types.forEach(function (t) {
            if (typeLayers[t].indexOf(c)>=0)
            {
                c.scale(hh);
            }

        })

    })
}

drawJS.drawInit = drawInit;
drawJS.setVisibleLayer = setVisibleLayer;

drawJS.onScroll = onScroll;

