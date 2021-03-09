
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}


CURRENT_SCHEME_ID = 33
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

    let hpos = 0

    jsonMap.floors.forEach(function (f) {


        var new_f = {id:f.id,name:f.name,editorHpos:hpos,rooms:[]}
        hpos+=1
        floors.push(new_f)


        f.rooms.forEach(function (r) {
            //console.log('adding room');
            newr = {id:r.id,floor:new_f,walls:r.walls,furniture:r.furniture}
            rooms.push(newr)


            r.qrs.forEach(function (q) {

                var aa = Math.round(q.direction*180/Math.PI)

                qrs.push({id:q.id,direction:aa,x:q.x,y:q.y,room:newr})
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
            newd = {id:d.id,x1:d.x1,y1:d.y1,x2:d.x2,y2:d.y2,width:d.width,room1:room1,room2:room2,floor:new_f}

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
        nodes.push({id:n.id,floor:f,x:n.x,y:n.y,obj_type:n.obj_type})
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


typeLayers = {}
types = ["rooms","doors","elevators","staircases","qrs","nodes","edges","furniture"]
types.forEach(function (t) {
    typeLayers[t] = []
    typeLayers[t+"Data"] = []
})





function onEditorLayerBox(layer,isLabel)
{


    var layerId = layer+(isLabel?"Data":"")

    var selection = document.getElementById(layerId+"Box" );


    setVisibleLayer(layerId,selection.checked)
    //console.log(selection.checked)
}



function setVisibleLayer(layer,visible)
{
    typeLayers[layer].forEach(function (o) {
        o.visible = visible;
    })
}





