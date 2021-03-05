


function coordsToEditor(x,y,floor) {
    var k = 60
    var hy = 15;

    var hOffset = floor*14*k;
    var vOffset = floor*3*k;


    res = [hOffset+x*k, vOffset+k*hy-y*k]


    return res;
}


mainGroup = new Group();






function drawInit()
{

    mainGroup = new Group();

    mainGroupStartOffset = null;



    floors.forEach(function (f) {

        txy = coordsToEditor(1,1,f.editorHpos)

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


        mainGroup.addChild(path);

        t = new PointText({
            point: start+new Point(5,20),
            content: r.id,
            fontSize: 20,
            justification: 'left'
        });

        mainGroup.addChild(t)


        typeLayers["roomsData"].push(t);





        /*
        p = new Path;
        p.strokeColor = 'green';

        p.moveTo(start);
        p.lineTo(xy2)

         */




    }


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


    /*

    for (var ii=0;ii<rooms.length;ii++)
    {
        r = rooms[ii];
        console.log(r)
        for (var jj=0;jj<r.qrs.length;jj++)
        {
            q = r.qrs[jj];
            var triangle = new Path.RegularPolygon(coordsToEditor(q.x,q.y,r.floor.editorHpos), 3, 4);
            triangle.fillColor = 'blue'

        }
    }
    */


    for (var ii=0;ii<edges.length;ii++)
    {
        e = edges[ii]



       // console.log(e)

        var p = new Path();

        p.strokeColor = 'red';
        if (e.node1.floor!==e.node2.floor)
        {


            p.strokeColor = '#aceeca';

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
            content: n.id,
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



drawInit();



