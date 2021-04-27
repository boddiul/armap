var SearchGraph = (function (undefined) {

    var extractKeys = function (obj) {
        var keys = [], key;
        for (key in obj) {
            Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
        }
        return keys;
    }

    var sorter = function (a, b) {
        return parseFloat (a) - parseFloat (b);
    }

    var findPaths = function (map, start, end, infinity) {
        infinity = infinity || Infinity;

        var costs = {},
            open = {'0': [start]},
            predecessors = {},
            keys;

        var addToOpen = function (cost, vertex) {
            var key = "" + cost;
            if (!open[key]) open[key] = [];
            open[key].push(vertex);
        }

        costs[start] = 0;

        while (open) {
            if(!(keys = extractKeys(open)).length) break;

            keys.sort(sorter);

            var key = keys[0],
                bucket = open[key],
                node = bucket.shift(),
                currentCost = parseFloat(key),
                adjacentNodes = map[node] || {};

            if (!bucket.length) delete open[key];

            for (var vertex in adjacentNodes) {
                if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
                    var cost = adjacentNodes[vertex],
                        totalCost = cost + currentCost,
                        vertexCost = costs[vertex];

                    if ((vertexCost === undefined) || (vertexCost > totalCost)) {
                        costs[vertex] = totalCost;
                        addToOpen(totalCost, vertex);
                        predecessors[vertex] = node;
                    }
                }
            }
        }

        if (costs[end] === undefined) {
            return null;
        } else {
            return predecessors;
        }

    }

    var extractShortest = function (predecessors, end) {
        var nodes = [],
            u = end;

        while (u !== undefined) {
            nodes.push(u);
            u = predecessors[u];
        }

        nodes.reverse();
        return nodes;
    }

    var findShortestPath = function (map, nodes) {
        var start = nodes.shift(),
            end,
            predecessors,
            path = [],
            shortest;

        while (nodes.length) {
            end = nodes.shift();
            predecessors = findPaths(map, start, end);

            if (predecessors) {
                shortest = extractShortest(predecessors, end);
                if (nodes.length) {
                    path.push.apply(path, shortest.slice(0, -1));
                } else {
                    return path.concat(shortest);
                }
            } else {
                return null;
            }

            start = end;
        }
    }

    var toArray = function (list, offset) {
        try {
            return Array.prototype.slice.call(list, offset);
        } catch (e) {
            var a = [];
            for (var i = offset || 0, l = list.length; i < l; ++i) {
                a.push(list[i]);
            }
            return a;
        }
    }

    var SearchGraph = function (map) {
        this.map = map;
    }

    SearchGraph.prototype.findShortestPath = function (start, end) {
        if (Object.prototype.toString.call(start) === '[object Array]') {
            return findShortestPath(this.map, start);
        } else if (arguments.length === 2) {
            return findShortestPath(this.map, [start, end]);
        } else {
            return findShortestPath(this.map, toArray(arguments));
        }
    }

    SearchGraph.findShortestPath = function (map, start, end) {
        if (Object.prototype.toString.call(start) === '[object Array]') {
            return findShortestPath(map, start);
        } else if (arguments.length === 3) {
            return findShortestPath(map, [start, end]);
        } else {
            return findShortestPath(map, toArray(arguments, 1));
        }
    }

    return SearchGraph;

})();




scheme = null;


paramTypes = ["scheme","floor","room","door","wall","furniture","elevator","staircase","qr"]


function onInputParam(t,p) {

    if (p==="name")
    {
        d = document.getElementById(t);

        currParamObject.name = d.value;
    }

}
function showParams(type,obj) {

    if (! (type==="room" || type==="scheme" || type==="floor"))
        return;


    paramTypes.forEach(function (v) {


        d = document.getElementById(v+"_params");

        //console.log(v+"_params",d);

        if (d)
        {
            if (v===type)
            {
                d.style.display = "block";
            }
            else
            {

                d.style.display = "none";
            }
        }


    })


    currParamObject = obj;
   // console.log(currParamObject)

    if (type==="scheme")
    {
       document.getElementById("p_scheme_id").value = currParamObject.id;
        document.getElementById("p_scheme_name").value = currParamObject.name;
        document.getElementById("p_scheme_address").value = currParamObject.address;
        document.getElementById("p_scheme_description").value = currParamObject.description;


        var canvas = document.getElementById('p_scheme_photo');
        var ctx = canvas.getContext('2d');
        let wh = 100;
        ctx.canvas.width = wh;
        ctx.canvas.height = wh;
        var over = new Image();
        over.onload = function () {
            let sz = (over.width<over.height) ? over.width : over.height;
            ctx.drawImage(over,over.width/2-sz/2,over.height/2-sz/2,sz,sz,0,0,wh,wh)
            scheme.photo = canvas.toDataURL();
        }
        over.src = currParamObject.photo;
    }
    else if (type==="floor")
    {
        document.getElementById("p_floor_id").value = currParamObject.id;
        document.getElementById("p_floor_name").value = currParamObject.name;
    }
    else if (type==="room")
    {
        document.getElementById("p_room_id").value = currParamObject.id;
        document.getElementById("p_room_name").value = currParamObject.name;
    }

    /*
    else if (type==="wall")
    {
        document.getElementById("p_wall_id").value = currParamObject.id;
    }
    else if (type==="qr")
    {
        document.getElementById("p_qr_id").value = currParamObject.id;
    }
    else if (type==="door")
    {
        document.getElementById("p_door_id").value = currParamObject.id;
    }
    else if (type==="element")
    {
        document.getElementById("p_door_id").value = currParamObject.id;
    }*/
}





SEARCH_SCHEME_ID = 36;


function onRequestIdBox()
{
    var selection = document.getElementById("requestIdBox" );
    SEARCH_SCHEME_ID = parseInt(selection.value)
}

function loadCurrentScheme() {
    loadScheme(SEARCH_SCHEME_ID,setCurrentScheme);
}


MAXSCHEMEID = 100;
function uploadCurrentScheme() {

    uploadScheme(MAXSCHEMEID,scheme.ToJSON(),function (id) {
        SEARCH_SCHEME_ID = id;
        document.getElementById("requestIdBox" ).value = id;

        document.getElementById("p_scheme_id" ).value = id;


        scheme.id = id;

    });

}

function loadScheme(id,onComplete,onFail) {


    $.ajax({
        type: "GET",
        url: '/scheme/'+id
    }).done(function(scheme) {
        onComplete(scheme);
    }).fail(function() {

    })

}

function uploadScheme(id,scheme,onComplete,onFail) {

    //console.log(id,scheme);
    $.ajax({
        type: "POST",
        url: '/scheme/',
        data: JSON.stringify(scheme),
        contentType: "application/json",
        dataType: "json"
    }).done(function(res) {
        //console.log(res);
        onComplete(res);

    }).fail(function() {

    })
}


function setCurrentScheme(jsonMap)
{
    maxFloorId = 0;
    maxRoomId = 0;
    maxWallId = 0;
    maxDoorId = 0;
    maxQRId = 0;
    maxFurnitureId = 0;



    drawJS.init();

    scheme = new Scheme(jsonMap);


    showParams("scheme",scheme);


   // console.log(maxRoomId);




}





function clearGraph() {


    scheme.graph.edges.forEach(function (e) {
        e.destroy();
    })


    scheme.graph.edges = []

    scheme.graph.nodes.forEach(function (n) {
        n.destroy();
    })

    scheme.graph.nodes = []
}

function createGraph() {







    var maxNodeId = 0;
    var maxEdgeId = 0;
    
    
    try
    {
        
   

         scheme.floors.forEach(function (f) {

        f.rooms.forEach(function (r) {







            let contour = [];


            //let xx =0;
            //let yy =0;

            let startWall = r.walls[0];
            let w = startWall;

            console.log('START MOVE');
            while (w.nextWall!==startWall)
            {
                console.log(w.x1, w.y1);
                contour.push(new poly2tri.Point(w.x1, w.y1));

                w = w.nextWall;
            }
            contour.push(new poly2tri.Point(w.x1, w.y1));


            var swctx = new poly2tri.SweepContext(contour);

            //xx = xx/r.walls.length;
            //yy = yy/r.walls.length;


            r.furniture.forEach(function (f) {
                let hole = [
                    new poly2tri.Point(f.x1, f.y1),
                    new poly2tri.Point(f.x2, f.y1),
                    new poly2tri.Point(f.x2, f.y2),
                    new poly2tri.Point(f.x1, f.y2),
                ];


                swctx.addHole(hole);
            })


            /*
            p = new Node(scheme.graph,{
                id:maxNodeId++,
                x:xx,
                y:yy,
                obj_type:"in_room",
                obj_id:r.id,
                floor_id:f.id
            })
            scheme.graph.nodes.push(p);
            p.SetLinks();*/


            swctx.triangulate();
            var triangles = swctx.getTriangles();


            triangles.forEach(function(t) {


                let xx =0;
                let yy=0;

                let points = []

                t.getPoints().forEach(function(p) {
                    //console.log(p.x, p.y);

                    points.push({x:p.x+f.x,y:p.y+f.y});
                    xx+=p.x;
                    yy+=p.y;
                });
                points.push(points[0]);

                drawJS.debugTriangle(points);

                xx/=3;
                yy/=3;


                let s =1;
                t.neighbors_.forEach(function (ot) {
                    if (ot !== null && ot.interior_) {

                        let tx =0;
                        let ty =0;
                        ot.getPoints().forEach(function(p) {
                            tx+=p.x;
                            ty+=p.y;
                        });
                        ty/=3;
                        tx/=3;


                        xx+=tx;
                        yy+=ty;

                        s+=1;

                    }
                });

                xx/=s;
                yy/=s


                let p = new Node(scheme.graph,{
                    id:maxNodeId++,
                    x:xx,
                    y:yy,
                    obj_type:"in_room",
                    obj_id:r.id,
                    floor_id:f.id
                })
                scheme.graph.nodes.push(p);
                p.SetLinks();


                t.node = p;
                // or t.getPoint(0), t.getPoint(1), t.getPoint(2)
            }.bind(this));



            triangles.forEach(function(t) {

                t.neighbors_.forEach(function (ot) {
                    if (ot!==null && ot.interior_)
                    {

                       // console.log(ot);
                        if (t.node.id<ot.node.id)
                        {
                            let e = new Edge(scheme.graph,{
                                id:maxEdgeId++,
                                node1_id:t.node.id,
                                node2_id:ot.node.id,
                                weight:Math.sqrt(Math.pow(t.node.x-ot.node.x,2)+Math.pow(t.node.y-ot.node.y,2))
                            })
                            scheme.graph.edges.push(e)
                            e.SetLinks();
                        }


                    }
                }.bind(this))


            }.bind(this));


            r.elevators.forEach(function (el) {


                p = new Node(scheme.graph,{
                    id:maxNodeId++,
                    x:el.x,
                    y:el.y,
                    obj_type:"elevator",
                    obj_id:el.id,
                    floor_id:f.id
                })
                scheme.graph.nodes.push(p);
                p.SetLinks();


                let bestRoomNode = null;
                let minDist = null;
                scheme.graph.nodes.forEach(function (n) {
                    if (n.objType==="in_room" && el.room && n.obj.id ===el.room.id)
                    {

                        let dist = Math.sqrt(Math.pow(n.x-el.x,2)+Math.pow(n.y-el.y,2));

                        if (minDist===null || dist<minDist)
                        {
                            bestRoomNode = n;
                            minDist = dist;
                        }

                    }

                })


                if (bestRoomNode)
                {


                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:p.id,
                        node2_id:bestRoomNode.id,
                        weight:minDist
                    })


                    scheme.graph.edges.push(e)
                    e.SetLinks();

                }


            })

            r.staircases.forEach(function (st) {

                p = new Node(scheme.graph,{
                    id:maxNodeId++,
                    x:st.x,
                    y:st.y,
                    obj_type:"staircase",
                    obj_id:st.id,
                    floor_id:f.id
                })
                scheme.graph.nodes.push(p);
                p.SetLinks();


                let bestRoomNode = null;
                let minDist = null;
                scheme.graph.nodes.forEach(function (n) {
                    if (n.objType==="in_room" && st.room && n.obj.id ===st.room.id)
                    {

                        dist = Math.sqrt(Math.pow(n.x-st.x,2)+Math.pow(n.y-st.y,2))

                        if (minDist===null || dist<minDist)
                        {
                            bestRoomNode = n;
                            minDist = dist;
                        }
                    }

                })


                if (bestRoomNode)
                {


                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:p.id,
                        node2_id:bestRoomNode.id,
                        weight:minDist
                    })


                    scheme.graph.edges.push(e)
                    e.SetLinks();

                }
            })


        })


        f.doors.forEach(function (d) {

            xx =(d.x1+d.x2)/2;

            yy = (d.y1+d.y2)/2;


            p = new Node(scheme.graph,{
                id:maxNodeId++,
                x:xx,
                y:yy,
                obj_type:"door",
                obj_id:d.id,
                floor_id:f.id
            })
            scheme.graph.nodes.push(p);
            p.SetLinks();





            let bestRoomNode1 = null;
            let minDist1 = null;

            let bestRoomNode2 = null;
            let minDist2 = null;

            scheme.graph.nodes.forEach(function (n) {
                let dist = Math.sqrt(Math.pow(n.x-xx,2)+Math.pow(n.y-yy,2));
                if (n.objType==="in_room" && d.room1 && n.obj.id ===d.room1.id)
                {
                    if (minDist1===null || dist<minDist1)
                    {
                        bestRoomNode1 = n;
                        minDist1 = dist;
                    }
                }
                if (n.objType==="in_room" && d.room2 && n.obj.id ===d.room2.id)
                {
                    if (minDist2===null || dist<minDist2)
                    {
                        bestRoomNode2 = n;
                        minDist2 = dist;
                    }
                }
            })
            if (bestRoomNode1!==null)
            {
                e = new Edge(scheme.graph,{
                    id:maxEdgeId++,
                    node1_id:p.id,
                    node2_id:bestRoomNode1.id,
                    weight:minDist1
                })


                scheme.graph.edges.push(e)
                e.SetLinks();
            }
            if (bestRoomNode2!==null)
            {

                e = new Edge(scheme.graph,{
                    id:maxEdgeId++,
                    node1_id:p.id,
                    node2_id:bestRoomNode2.id,
                    weight:minDist2
                })
                scheme.graph.edges.push(e)
                e.SetLinks();
            }
        })

        f.rooms.forEach(function (r) {
            r.qrs.forEach(function (q) {


                aa = q.direction / 180 * Math.PI;
                xx = q.x - Math.cos(aa) * 0.1;
                yy = q.y - Math.sin(aa) * 0.1;
                p = new Node(scheme.graph,{
                    "id": maxNodeId++,
                    "floor_id": q.room.floor.id,
                    "x": xx,
                    "y": yy,
                    "obj_type": "qr",
                    "obj_id": q.id
                });

                scheme.graph.nodes.push(p);
                p.SetLinks();



                nds = []
                scheme.graph.nodes.forEach(function (n) {

                    if (n.floor.id===p.floor.id)
                    {

                        ok = false;
                        if (n.objType==="in_room" && n.obj.id===q.room.id)
                            ok = true;

                        if (n.objType==="door" && (n.obj.room1 && n.obj.room1.id===q.room.id))
                            ok = true;

                        if (n.objType==="door" && (n.obj.room2 && n.obj.room2.id===q.room.id))
                            ok = true;

                        if (n.objType==="qr" && n.obj.room.id === q.room.id)
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


                //console.log(nds)

                for (let i=1;i<Math.min(3,nds.length);i++)
                {
                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:p.id,
                        node2_id:nds[i].node.id,
                        weight:nds[i].dist
                    })

                    scheme.graph.edges.push(e)
                    e.SetLinks();

                }

            })

            r.staircases.forEach(function (s) {


                var n1 = null;
                var nDown = null;
                var nUp = null;


                f.scheme.graph.nodes.forEach(function (n) {
                    if (n.obj===s)
                        n1 = n;
                    if (n.obj===s.staircaseUp)
                        nUp = n;
                    if (n.obj===s.staircaseDown)
                        nDown = n;
                })

              //  console.log(s);
                if (s.staircaseDown!= null && s.staircaseDown.id<s.id)
                {
                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:n1.id,
                        node2_id:nDown.id,
                        weight:15
                    })


                    scheme.graph.edges.push(e)
                    e.SetLinks();
                }
                if (s.staircaseUp!=null && s.staircaseUp.id<s.id)
                {
                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:n1.id,
                        node2_id:nUp.id,
                        weight:15
                    })

                    scheme.graph.edges.push(e)
                    e.SetLinks();
                }
            })


            r.elevators.forEach(function (el) {


                var n1 = null;
                var nDown = null;
                var nUp = null;


                f.scheme.graph.nodes.forEach(function (n) {
                    if (n.obj===el)
                        n1 = n;
                    if (n.obj===el.elevatorUp)
                        nUp = n;
                    if (n.obj===el.elevatorDown)
                        nDown = n;
                })

               // console.log(el);
                if (el.elevatorDown!= null && el.elevatorDown.id<el.id)
                {
                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:n1.id,
                        node2_id:nDown.id,
                        weight:15
                    })


                    scheme.graph.edges.push(e)
                    e.SetLinks();
                }
                if (el.elevatorUp!=null && el.elevatorUp.id<el.id)
                {
                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:n1.id,
                        node2_id:nUp.id,
                        weight:15
                    })

                    scheme.graph.edges.push(e)
                    e.SetLinks();
                }
            })
        })











    })


    }
    catch (e) {
        alert("Мебель пересекается/Прилегает друг к другу"+'\n'+e.message);

        clearGraph();
    }

}


function fixGraph() {


    scheme.floors.forEach(function (f) {

        f.rooms.forEach(function (r) {


            let cx = 0;
            let cy = 0;

            r.walls.forEach(function (w) {
                cx += w.x1;
                cy += w.y1;
            })
            cx /= r.walls.length;
            cy /= r.walls.length;


            let roomNodes = [];
            let initNodes = [];
            let idToNode = {};
            let roomGraph = {};

            let usedId = {};

            scheme.graph.nodes.forEach(function (n) {

                let add = false;
                if (n.objType === "in_room") {
                    if (n.obj.id === r.id)
                        add = true;

                } else if (n.objType === "door") {
                    if (n.obj.room1 === r || n.obj.room2 === r) {
                        add = true;
                        initNodes.push(n);
                    }
                } else {
                    if (n.obj.room.id === r.id) {
                        add = true;
                        initNodes.push(n);
                    }
                }
                if (add) {

                    console.log(n);

                    roomNodes.push(n);
                    idToNode[n.id.toString()] = n;
                    roomGraph[n.id.toString()] = {};
                    usedId[n.id.toString()] = false;
                }


            });

            if (initNodes.length < 2)
                return;

            scheme.graph.edges.forEach(function (e) {

                if (e.node1.id.toString() in roomGraph && e.node2.id.toString() in roomGraph) {
                    let ex = (e.node1.x + e.node2.y) / 2;
                    let ey = (e.node1.y + e.node2.y) / 2;

                    let dist = Math.sqrt(Math.pow(ex - cx, 2) + Math.pow(ey - cy, 2));
                    let weight = Math.floor(e.weight * 10 * dist * dist * dist);


                    roomGraph[e.node1.id.toString()][e.node2.id.toString()] = weight;
                    roomGraph[e.node2.id.toString()][e.node1.id.toString()] = weight;
                }


            });

            console.log(roomGraph);
            console.log(initNodes);

            let sg = new SearchGraph(roomGraph);


            for (let i = 0; i < initNodes.length - 1; i++)
                for (let j = i + 1; j < initNodes.length; j++) {

                    let res = sg.findShortestPath(initNodes[i].id.toString(), initNodes[j].id.toString());
                    console.log(initNodes[i].id.toString(), initNodes[j].id.toString());
                    console.log(res);
                    res.forEach(function (r) {
                        usedId[r] = true;
                    })


                }


            console.log(usedId);

            let nodesForDeletion = {};
            let edgesForDeletion = {};


            for (let i = 0; i < roomNodes.length; i++) {
                if (!usedId[roomNodes[i].id.toString()]) {
                    nodesForDeletion[roomNodes[i].id] = true;
                    roomNodes[i].destroy();
                }
            }

            scheme.graph.edges.forEach(function (e) {

                if (e.node1.id in nodesForDeletion || e.node2.id in nodesForDeletion) {
                    edgesForDeletion[e.id] = true;
                    e.destroy();
                }
            });


            console.log(nodesForDeletion);
            scheme.graph.nodes = scheme.graph.nodes.filter(n => !(n.id in nodesForDeletion))

            scheme.graph.edges = scheme.graph.edges.filter(e => !(e.id in edgesForDeletion))


            //nodes.forEach()

        });
    });
}


function newRoom() {
    waitingToCreate = "room";
    drawJS.askInput(["floor"],"Adding new room. Please select:",["Floor"]);


}

function newFloor() {

    waitingToCreate = "floor";
    drawJS.askInput([],"",[])
    //mainCreate(null)
}

function newDoor() {
    waitingToCreate = "door";
    drawJS.askInput(["room","room"],"Adding new door. Please select:",["Room 1","Room 2"])



}



function newWall(){
    waitingToCreate = "wall";
    drawJS.askInput(["wall"],"Adding new wall. Please select:",["Wall"])

}

function newFurniture(){
    waitingToCreate = "furniture";
    drawJS.askInput(["room"],"Adding new furniture. Please select:",["Room 1"])

}

function newQR() {
    waitingToCreate = "qr";
    drawJS.askInput(["wall"],"Adding new qr. Please select:",["wall"]);


}


function mainCreate(data) {
    if (waitingToCreate==="floor")
    {
        maxFloorId+=1;
        var f = new Floor(scheme,{
            id:maxFloorId,
            name:"new floor",
            rooms:[],
            doors:[]
        })

        scheme.floors.push(f);
    }
    else if (waitingToCreate==="room")
    {
        maxRoomId+=1;
        maxWallId+=4;



        r = new Room(data[0],{
            id:maxRoomId,
            name:"new room",
            description:"",
            can_search: true,
            elevators:[],
            staircases:[],
            furniture:[],
            qrs:[],
            walls:[
                        {"id":maxWallId-3,"x1":2,"y1":-4,"x2":5,"y2":-4,    "wall_prev_id":maxWallId,"wall_next_id":maxWallId-2},
                        {"id":maxWallId-2,"x1":5,"y1":-4,"x2":5,"y2":-7,     "wall_prev_id":maxWallId-3,"wall_next_id":maxWallId-1},
                        {"id":maxWallId-1,"x1":5,"y1":-7,"x2":2,"y2":-7,     "wall_prev_id":maxWallId-2,"wall_next_id":maxWallId},
                        {"id":maxWallId,"x1":2,"y1":-7,"x2":2,"y2":-4,      "wall_prev_id":maxWallId-1,"wall_next_id":maxWallId-3}

            ]



        })
        data[0].rooms.push(r);
    }
    else if (waitingToCreate==="door")
    {
        maxDoorId+=1;

        var f = data[0].floor;
        var r1 = data[0];
        var r2 = data[1];



        var w1 = r1.walls.reduce(function(prev, curr) {
            return (Math.sqrt(Math.pow((curr.x1+curr.x2)/2-r2.x,2)+Math.pow((curr.y1+curr.y2)/2-r2.y,2))
            < Math.sqrt(Math.pow((prev.x1+prev.x2)/2-r2.x,2)+Math.pow((prev.y1+prev.y2)/2-r2.y,2))
                ? curr : prev);
        });

        var w2 = r2.walls.reduce(function(prev, curr) {
            return (Math.sqrt(Math.pow((curr.x1+curr.x2)/2-r1.x,2)+Math.pow((curr.y1+curr.y2)/2-r1.y,2))
            < Math.sqrt(Math.pow((prev.x1+prev.x2)/2-r1.x,2)+Math.pow((prev.y1+prev.y2)/2-r1.y,2))
                ? curr : prev);
        });


        d = new Door(f,{
            id:maxDoorId,
            x1:(w1.x1+w1.x2)/2,
            y1:(w1.y1+w1.y2)/2,
            x2:(w2.x1+w2.x2)/2,
            y2:(w2.y1+w2.y2)/2,
            room1_id: r1.id,
            room2_id: r2.id,
            wall1_id: w1.id,
            wall2_id: w2.id,
            width:9
        })

        f.doors.push(d);

        d.SetLinks();
    }
    else if (waitingToCreate==="qr")
    {
        maxQRId+=1;

        var r = data[0].room;
        var w = data[0];

        var q = new QR(r,{
            id:maxQRId,
            x : w.x1+(w.x2-w.x1)*0.3,
            y : w.y1+(w.y2-w.y1)*0.3,
            direction:0,
            wall_id:w.id
        })

        r.qrs.push(q)

        q.SetLinks();
    }
    else if (waitingToCreate==="wall")
    {
        maxWallId+=1;

        let r = data[0].room;
        let selectedWall = data[0];
        let nextWall = data[0].nextWall;

        let newWall = new Wall(r,{
            id:maxWallId,
            x1 : (selectedWall.x1+selectedWall.x2)/2,
            y1 : (selectedWall.y1+selectedWall.y2)/2,
            x2 : selectedWall.x2,
            y2 : selectedWall.y2,
            wall_prev_id : selectedWall.id,
            wall_next_id : nextWall.id
        });

        selectedWall.x2 = (selectedWall.x1+selectedWall.x2)/2;
        selectedWall.y2 = (selectedWall.y1+selectedWall.y2)/2;
        selectedWall.nextWall = newWall;
        nextWall.prevWall = newWall;


        r.walls.push(newWall);

        newWall.SetLinks();




    }
    else if (waitingToCreate==="furniture")
    {
        maxFurnitureId+=1;

        let r = data[0];

        let xx =0;
        let yy=0;
        r.walls.forEach(function (w) {

            xx+=w.x1;
            yy+=w.y1;
        })
        xx/=r.walls.length+Math.round(Math.random())
        yy/=r.walls.length+Math.round(Math.random());



        let ff = new Furniture(r,{
            id:maxFurnitureId,
            name:"",
            x1:xx-0.5,
            y1:yy-0.5,
            x2:xx+0.5,
            y2:yy+0.5
        });



        r.furniture.push(ff);


    }

}

function onEditorLayerBox(layer,isLabel)
{


    var layerId = layer+(isLabel?"Data":"")


    var selection = document.getElementById(layerId+"Box" );

    drawJS.setVisibleLayer(layer,isLabel,selection.checked)
    //console.log(selection.checked)
}






window.addEventListener('wheel', function (e) {
    drawJS.onScroll(e);
});


window.addEventListener('load',function (e)
{



    newFile();

});



function newFile() {


    emptySchemeJSON = {
        "id":0,
        "name":"",
        "address":"",
        "description":"",
        "floors":[],
        "graph":{
            "nodes":[],
            "edges":[]
        }
    };

    setCurrentScheme(emptySchemeJSON);
}

function openFile() {
    var fileToLoad = document.getElementById("file-input").files[0];

    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent)
    {
        var textFromFileLoaded = fileLoadedEvent.target.result;


        setCurrentScheme(JSON.parse(textFromFileLoaded));

    };
    fileReader.readAsText(fileToLoad, "UTF-8");

}

function openPhoto() {
    var fileToLoad = document.getElementById("photo-input").files[0];

    var fileReader = new FileReader();
    fileReader.onloadend  = function(fileLoadedEvent)
    {
       // var textFromFileLoaded = fileLoadedEvent.target.result;

        var canvas = document.getElementById('p_scheme_photo');
        var ctx = canvas.getContext('2d');
        let wh = 100;
        ctx.canvas.width = wh;
        ctx.canvas.height = wh;
        var over = new Image();
        over.onload = function () {
            let sz = (over.width<over.height) ? over.width : over.height;
            ctx.drawImage(over,over.width/2-sz/2,over.height/2-sz/2,sz,sz,0,0,wh,wh)
            scheme.photo = canvas.toDataURL();
        }
        over.src = fileLoadedEvent.target.result;


        //setCurrentScheme(JSON.parse(textFromFileLoaded));

    };
    fileReader.readAsDataURL(fileToLoad);

}



function saveFile() {

    var j = scheme.ToJSON();
    var textToSave = JSON.stringify(j);
    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = "map"+j.id+".json";

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = function (e) {
        document.body.removeChild(e.target);
    };
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

function mainOnLoad() {
    drawJS.mainOnLoad();

}