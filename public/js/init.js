
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}


CURRENT_SCHEME_ID = 36
SEARCH_SCHEME_ID = CURRENT_SCHEME_ID


function onRequestIdBox()
{
    var selection = document.getElementById("requestIdBox" );
    SEARCH_SCHEME_ID = parseInt(selection.value)
}

function loadLevel(id)
{
    CURRENT_SCHEME_ID = id
    var jsonMap = JSON.parse( httpGet('/scheme/'+CURRENT_SCHEME_ID))

    console.log(jsonMap)



    floors = []

    rooms = []

    nodes = []

    edges = []

    qrs = []

    doors = []

    elevators = []

    staircases = []

    let hpos = 0

    jsonMap.floors.forEach(function (f) {


        var new_f = {id:f.id,name:f.name,editorHpos:hpos,rooms:[]}
        hpos+=1
        floors.push(new_f)


        f.rooms.forEach(function (r) {
            //console.log('adding room');
            newr = {id:r.id,name:r.name,floor:new_f,walls:r.walls,furniture:r.furniture}
            rooms.push(newr)


            r.qrs.forEach(function (q) {

                var aa = Math.round(q.direction*180/Math.PI)

                qrs.push({id:q.id,direction:aa,x:q.x,y:q.y,room:newr})
            })


            r.elevators.forEach(function (e) {
                var aa = Math.round(e.direction*180/Math.PI)

                elevators.push({id:e.id,direction:aa,x:e.x,y:e.y,room:newr})
            })


            r.staircases.forEach(function (s) {
                var aa = Math.round(s.direction*180/Math.PI)

                staircases.push({id:s.id,direction:aa,x:s.x,y:s.y,width:s.width,height:s.height,room:newr})
            })

        })


        f.doors.forEach(function (d) {

            room1 = null
            room2 = null
            rooms.forEach(function (r){
                if (r.id===d.room1_id)
                    room1 = r;
                if (r.id===d.room2_id)
                    room2 = r;
            })
            newd = {id:d.id,x1:d.x1,y1:d.y1,x2:d.x2,y2:d.y2,width:d.width,room1:room1,room2:room2,floor:new_f,direction:Math.atan2(d.y2-d.y1,d.x2-d.x1)}

            doors.push(newd)
        })

    })
    console.log(rooms)
    console.log(doors)
    jsonMap.graph.nodes.forEach(function (n) {

        f = null
        for (i=0;i<floors.length;i++)
        {
            if (floors[i].id===n.floor_id)
                f = floors[i]
        }
        nodes.push({id:n.id,floor:f,x:n.x,y:n.y,obj_id:n.obj_id,obj_type:n.obj_type})
    })


    jsonMap.graph.edges.forEach(function (e) {

        n1 = null
        n2 = null
        for (i=0;i<nodes.length;i++)
        {
            if (nodes[i].id ===  e.node1_id)
                n1 = nodes[i]
            if (nodes[i].id ===  e.node2_id)
                n2 = nodes[i]

        }



        edges.push({id:e.id,node1:n1,node2:n2,weight:e.weight})


    })

    drawJS.drawInit();


}





function clearGraph() {

    nodes = []
    edges = []

    drawJS.drawInit();
}

function createGraph() {

    nodes = []
    edges = []


    n_id = 0;
    e_id = 0;
    rooms.forEach(function (r) {
        let xx =0;
        let yy =0;

        r.walls.forEach(function (w) {
            xx+=w.x1;
            yy+=w.y1;
        })

        xx = xx/r.walls.length;
        yy = yy/r.walls.length;

        nodes.push({
            "id":n_id,
            "floor":r.floor,
            "x":xx,
            "y":yy,
            "obj_type":"in_room",
            "obj_id":r.id,
        });
        n_id+=1;
    })


    doors.forEach(function (d) {




        xx = (d.x1+d.x2)/2
        yy = (d.y1+d.y2)/2
        n = {
            "id":n_id,
            "floor":d.floor,
            "x":xx,
            "y":yy,
            "obj_type":"door",
            "obj_id":d.id,
            "obj":d
        }
        nodes.push(n);
        n_id+=1


        var r1_node = null
        var r2_node = null
        nodes.forEach(function (n) {
            if (n.obj_type==="in_room" && d.room1 && n.obj_id ===d.room1.id)
                r1_node = n;
            if (n.obj_type==="in_room" && d.room2 && n.obj_id ===d.room2.id)
                r2_node = n;
        })


        if (r1_node)
        {
            dist = Math.sqrt(Math.pow(r1_node.x-xx,2)+Math.pow(r1_node.y-yy,2))

            edges.push({
                "id":e_id,
                "node1":n,
                "node2":r1_node,
                "weight":dist
            })
            e_id+=1

        }

        if (r2_node)
        {
            dist = Math.sqrt(Math.pow(r2_node.x-xx,2)+Math.pow(r2_node.y-yy,2))

            edges.push({
                "id":e_id,
                "node1":n,
                "node2":r2_node,
                "weight":dist
            })
            e_id+=1

        }



    })


    qrs.forEach(function (q) {
        aa = q.direction/180*Math.PI;
        xx = q.x -Math.cos(aa)*0.1;
        yy = q.y -Math.sin(aa)*0.1;
        new_node = {
            "id":n_id,
            "floor":q.room.floor,
            "x":xx,
            "y":yy,
            "obj_type":"qr",
            "obj_id":q.id,
            "obj":q
        }
        nodes.push(new_node);
        n_id+=1;



        nds = []
        nodes.forEach(function (n) {

            if (n.floor.id===new_node.floor.id)
            {

                ok = false;
                if (n.obj_type==="in_room" && n.obj_id===q.room.id)
                    ok = true;

                if (n.obj_type==="door" && (n.obj.room1 && n.obj.room1.id===q.room.id))
                    ok = true;

                if (n.obj_type==="door" && (n.obj.room2 && n.obj.room2.id===q.room.id))
                    ok = true;

                if (n.obj_type==="qr" && n.obj.room.id === q.room.id)
                    ok = true;

                if (ok)
                    nds.push({
                        "node":n,
                        "dist":Math.sqrt(Math.pow(n.x-xx,2)+Math.pow(n.y-yy,2))
                    })
            }

        })



        nds.sort(function (a, b) {
            if (a.dist > b.dist) {
                return 1;
            }
            if (a.dist < b.dist) {
                return -1;
            }
            return 0;
        });


        console.log(nds)

        for (let i=1;i<Math.min(3,nds.length);i++)
        {
            console.log(i)
            edges.push({
                "id":e_id,
                "node1":new_node,
                "node2":nds[i].node,
                "weight":nds[i].dist
            })
            e_id+=1
        }







    })



    drawJS.drawInit();
}



function onEditorLayerBox(layer,isLabel)
{


    var layerId = layer+(isLabel?"Data":"")

    var selection = document.getElementById(layerId+"Box" );


    drawJS.setVisibleLayer(layerId,selection.checked)
    //console.log(selection.checked)
}






window.addEventListener('wheel', function (e) {
    drawJS.onScroll(e);
});


