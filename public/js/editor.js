SearchGraph = (function (undefined) {

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



function EditorController() {


    this.currentParamObject = null;
    this.scheme = null;



    this.GetScheme = function () {
        return this.scheme;
    }


    this.NewFile = function () {

        let emptySchemeJSON = {
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

        this.SetScheme(emptySchemeJSON);
    }



    this.SetVisibleLayer = function (layer,isText,visible)
    {
        DrawJS.SetVisibleLayer(layer,isText,visible)
    }

    this.ShowParams = function (type,obj) {


        if (type==="scheme")
            obj = this.scheme;
        this.currentParamObject = obj;


        InterfaceJS.ShowParams(type,obj);



    }


    this.SetScheme = function (jsonMap) {

        maxFloorId = 0;
        maxRoomId = 0;
        maxWallId = 0;
        maxDoorId = 0;
        maxQRId = 0;
        maxFurnitureId = 0;

        DrawJS.Init();

        this.scheme = new Scheme(jsonMap);

        console.log(this);
        this.ShowParams("scheme",this.scheme);




        DrawJS.UpdateCanvas();
    }

    this.LoadScheme = function(id) {
        BackendJS.LoadScheme(id,function (scheme) {
            this.SetScheme(scheme);
            }.bind(this),
            function (e) {
            console.log(e);
        });
    }


    this.UploadScheme = function () {
        BackendJS.UploadScheme(this.scheme.ToJSON(),function (id) {

            InterfaceJS.SetSearchSchemeId(id)

            InterfaceJS.UpdateParams("scheme",this.scheme);
            this.scheme.id = id;




        }.bind(this), function (e) {
            console.log(e);
        });

    }

    this.SetSelectedObjectParam = function (param,value) {

        this.currentParamObject[param] = value;
    }
    this.DestroySelectedObject = function () {


        if (this.currentParamObject.destroy)
        {


            this.currentParamObject.destroy(true);
            this.currentParamObject = null;
        }


    }

    this.OnLoad = function () {
        DrawJS.OnLoad();
        InterfaceJS.OnLoad();
    }


    this.OpenSchemeData = function(id) {
        BackendJS.OpenSchemeData(id);
    }

    this.OpenSchemeInfoData = function(id) {
        BackendJS.OpenSchemeInfoData(id);
    }

    this.OpenSchemeQRPDF = function(id) {
        BackendJS.OpenSchemeQRPDF(id);
    }

    this.OpenSchemeHelpPDF = function(id) {
        BackendJS.OpenSchemeHelpPDF(id);
    }

    this.MainCreate = function (data) {
        if (this.waitingToCreate==="floor")
        {
            maxFloorId+=1;
            let f = new Floor(this.scheme,{
                id:maxFloorId,
                name:"new floor",
                rooms:[],
                doors:[]
            })

            this.scheme.floors.push(f);
        }
        else if (this.waitingToCreate==="room")
        {
            maxRoomId+=1;
            maxWallId+=4;



            let cx = -1;
            let cy = 7;
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
                    {"id":maxWallId-3,"x1":cx+2,"y1":cy-4,"x2":cx+5,"y2":cy-4,    "wall_prev_id":maxWallId,"wall_next_id":maxWallId-2},
                    {"id":maxWallId-2,"x1":cx+5,"y1":cy-4,"x2":cx+5,"y2":cy-7,     "wall_prev_id":maxWallId-3,"wall_next_id":maxWallId-1},
                    {"id":maxWallId-1,"x1":cx+5,"y1":cy-7,"x2":cx+2,"y2":cy-7,     "wall_prev_id":maxWallId-2,"wall_next_id":maxWallId},
                    {"id":maxWallId,"x1":cx+2,"y1":cy-7,"x2":cx+2,"y2":cy-4,      "wall_prev_id":maxWallId-1,"wall_next_id":maxWallId-3}

                ]



            })
            data[0].rooms.push(r);
        }
        else if (this.waitingToCreate==="door")
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
                width:0.9
            })

            f.doors.push(d);

            d.SetLinks();
        }
        else if (this.waitingToCreate==="qr")
        {
            maxQRId+=1;

            var r = data[0].room;
            var w = data[0];


            let dir = Math.atan2(w.y2-w.y1,w.x2-w.x1) + Math.PI/2;

            if (dir<0)
                dir +=Math.PI*2;

            if (dir>Math.PI*2)
                dir -= Math.PI*2;


            var q = new QR(r,{
                id:maxQRId,
                x : w.x1+(w.x2-w.x1)*0.3,
                y : w.y1+(w.y2-w.y1)*0.3,
                direction:dir,
                wall_id:w.id
            })

            r.qrs.push(q)

            q.SetLinks();
        }
        else if (this.waitingToCreate==="wall")
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
        else if (this.waitingToCreate==="furniture")
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

        DrawJS.UpdateCanvas();

    }



    this.NewFloor = function () {

        this.waitingToCreate = "floor";
        DrawJS.AskInput([],"",[])

    }


    this.NewRoom = function () {
        this.waitingToCreate = "room";
        DrawJS.AskInput(["floor"],"Adding new room. Please select:",["Floor"]);

    }

    this.NewWall = function () {
        this.waitingToCreate = "wall";
        DrawJS.AskInput(["wall"],"Adding new wall. Please select:",["Wall"])

    }

    this.NewDoor = function () {
        this.waitingToCreate = "door";
        DrawJS.AskInput(["room","room"],"Adding new door. Please select:",["Room 1","Room 2"])

    }

    this.NewFurniture = function () {
        this.waitingToCreate = "furniture";
        DrawJS.AskInput(["room"],"Adding new furniture. Please select:",["Room 1"])


    }

    this.NewStaircase = function () {
        this.waitingToCreate = "staircase";
        DrawJS.AskInput(["wall","staircase","staircase"],"Adding new staircase. Please select:",["Wall","Lower Staircase","Upper Staircase"])

    }

    this.NewElevator = function () {
        this.waitingToCreate = "elevator";
        DrawJS.AskInput(["wall","elevator","elevator"],"Adding new elevator. Please select:",["Wall","Lower Elevator","Upper Elevator"])

    }

    this.NewQR = function () {
        this.waitingToCreate = "qr";
        DrawJS.AskInput(["wall"],"Adding new qr. Please select:",["wall"]);


    }


    this.ClearGraph = function () {
        DrawJS.RemoveDebugTriangles();

        let scheme = this.scheme;

        scheme.graph.edges.forEach(function (e) {
            e.destroy(false);
        })


        scheme.graph.edges = []

        scheme.graph.nodes.forEach(function (n) {
            n.destroy(false);
        })

        scheme.graph.nodes = []


    }

    this.CreateGraph = function (trType) {




        var startTime = (new Date().getTime() / 1000);



        var maxNodeId = 0;
        var maxEdgeId = 0;


        try
        {

            let scheme = this.scheme;


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

                    console.log((new Date().getTime() / 1000)+' TRIANGULATION STARTED');

                    swctx.triangulate();

                    console.log((new Date().getTime() / 1000)+' TRIANGULATION ENDED');

                    var triangles = swctx.getTriangles();


                    triangles.forEach(function(t) {


                        let xx = 0;
                        let yy = 0;




                        let points = []

                        t.getPoints().forEach(function (p) {
                            //console.log(p.x, p.y);

                            points.push({x: p.x + f.x, y: p.y + f.y});
                            xx += p.x;
                            yy += p.y;
                        });
                        points.push(points[0]);

                        DrawJS.DebugTriangle(points);

                        xx /= 3;
                        yy /= 3;





                        if (trType===1) {


                            let s = 1;
                            t.neighbors_.forEach(function (ot) {
                                if (ot !== null && ot.interior_) {

                                    let tx = 0;
                                    let ty = 0;
                                    ot.getPoints().forEach(function (p) {
                                        tx += p.x;
                                        ty += p.y;
                                    });
                                    ty /= 3;
                                    tx /= 3;


                                    xx += tx;
                                    yy += ty;

                                    s += 1;

                                }
                            });

                            xx /= s;
                            yy /= s

                        }








                        if (trType===2)
                        {
                            let s =0;
                            xx = 0;
                            yy =0;

                            let gp = t.getPoints();
                            let myPoints = [gp[0],gp[1],gp[2],gp[0]];

                            t.neighbors_.forEach(function (ot) {
                                if (ot !== null && ot.interior_) {

                                    //let tx =0;
                                    //let ty =0;

                                    let ogp = ot.getPoints();
                                    let otherPoints = [ogp[0],ogp[1],ogp[2],ogp[0]];




                                    let best_i = null;
                                    let min_dist = -1;
                                    for (let ti=0;ti<3;ti++)
                                    {
                                        let pp1x = (myPoints[ti].x+myPoints[ti+1].x)/2;
                                        let pp1y = (myPoints[ti].y+myPoints[ti+1].y)/2;

                                        for (let oti=0;oti<3;oti++)
                                        {
                                            let pp2x = (otherPoints[oti].x+otherPoints[oti+1].x)/2;
                                            let pp2y = (otherPoints[oti].y+otherPoints[oti+1].y)/2;


                                            let dist = Math.sqrt(Math.pow(pp1x-pp2x,2)+Math.pow(pp1y-pp2y,2));

                                            if (best_i===null || dist<min_dist)
                                            {
                                                best_i = ti;
                                                min_dist = dist;
                                            }

                                        }
                                    }






                                    xx+=(myPoints[best_i].x+myPoints[best_i+1].x)/2;
                                    yy+=(myPoints[best_i].y+myPoints[best_i+1].y)/2;

                                    s+=1;

                                }
                            });

                            xx/=s;
                            yy/=s
                        }



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


            DrawJS.UpdateCanvas();
        }
        catch (e) {
            alert("Мебель пересекается/Прилегает друг к другу"+'\n'+e.message);

            this.ClearGraph();
        }

        console.log ('TOTAL SECONDS '+((new Date().getTime() / 1000)-startTime));

    }



    this.RemoveDebugTriangle = function () {
        DrawJS.RemoveDebugTriangles();
    }

    this.FixGraph = function ()  {


        let scheme = this.scheme;
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
                        roomNodes[i].destroy(false);
                    }
                }

                scheme.graph.edges.forEach(function (e) {

                    if (e.node1.id in nodesForDeletion || e.node2.id in nodesForDeletion) {
                        edgesForDeletion[e.id] = true;
                        e.destroy(false);
                    }
                });


                console.log(nodesForDeletion);
                scheme.graph.nodes = scheme.graph.nodes.filter(n => !(n.id in nodesForDeletion))

                scheme.graph.edges = scheme.graph.edges.filter(e => !(e.id in edgesForDeletion))


                //nodes.forEach()

            });
        });
    }

}





