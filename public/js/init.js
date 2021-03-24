

QR = function(room,jsonDataQR)
{
    this.room = room;

    this.id = jsonDataQR.id;

    this.x = jsonDataQR.x;
    this.y = jsonDataQR.y;
    this.initWallId = jsonDataQR.wall_id;

    this.direction = jsonDataQR.direction / Math.PI * 180;

    this.SetLinks = function () {
        this.drawElement = drawJS.addQRElement(this);
    }


    this.ToJSON = function () {
        j = {
            id:this.id,
            x:this.x,
            y:this.y,
            wall_id:this.initWallId,
            direction:this.direction * Math.PI / 180
        }

        return j;
    }


    this.move = function (index,dx,dy) {
        this.x += dx;
        this.y += dy;
    }


}



Staircase = function(room,jsonDataStaircase)
{

    this.room = room;

    this.id = jsonDataStaircase.id;

    this.x = jsonDataStaircase.x;
    this.y = jsonDataStaircase.y;

    this.width = jsonDataStaircase.width;
    this.height = jsonDataStaircase.height;

    this.direction = jsonDataStaircase.direction / Math.PI * 180;



    if (typeof jsonDataStaircase.staircase_up_id != "undefined")
        this.initStaircaseUpId = jsonDataStaircase.staircase_up_id

    if (typeof jsonDataStaircase.staircase_down_id  != "undefined")
        this.initStaircaseDownId = jsonDataStaircase.staircase_down_id

    console.log(this.initStaircaseDownId,this.initStaircaseUpId);

    this.staircaseUp = null;
    this.staircaseDown = null;

    this.SetLinks = function () {



        this.room.floor.scheme.floors.forEach(function (f) {

            f.rooms.forEach(function (r) {
                r.staircases.forEach(function (s) {
                    console.log(s.id,this.initStaircaseUpId,this.initStaircaseDownId)

                    if (typeof this.initStaircaseUpId != "undefined")
                        if (s.id === this.initStaircaseUpId)
                            this.staircaseUp = s;

                    if (typeof this.initStaircaseDownId != "undefined")
                        if (s.id === this.initStaircaseDownId)
                            this.staircaseDown = s;
                }.bind(this))
            }.bind(this))
        }.bind(this))

        console.log("AFTER")
        console.log(this)


        this.drawElement = drawJS.addStaircaseElement(this);
    }

    this.ToJSON = function () {
        j = {
            id:this.id,
            x:this.x,
            y:this.y,
            weight:this.weight,
            height:this.height,
            direction:this.direction * Math.PI / 180

        }

        if (this.staircaseDown)
            j["staircase_down_id"] = this.staircaseDown.id
        if (this.staircaseUp)
            j["staircase_up_id"] = this.staircaseUp.id

        return j;
    }
}

Elevator = function(room,jsonDataElevator)
{


    this.room = room;
    this.id = jsonDataElevator.id;

    this.x = jsonDataElevator.x;
    this.y = jsonDataElevator.y;



    this.direction = jsonDataElevator.direction / Math.PI * 180;



    this.initWallId = jsonDataElevator.wall_id;

    if (typeof jsonDataElevator.elevator_up_id != "undefined")
        this.initElevatorUpId = jsonDataElevator.elevator_up_id

    if (typeof jsonDataElevator.elevator_down_id  != "undefined")
        this.initElevatorDownId = jsonDataElevator.elevator_down_id


    this.elevatorUp = null;
    this.elevatorDown = null;


    this.SetLinks = function () {

        this.room.walls.forEach(function (w) {
            if (w.id ===this.initWallId)
                this.wall = w;
        }.bind(this))


        this.room.floor.scheme.floors.forEach(function (f) {

            f.rooms.forEach(function (r) {
                r.elevators.forEach(function (e) {

                    if (typeof this.initElevatorUpId != "undefined")
                        if (e.id === this.initElevatorUpId)
                            this.elevatorUp = e;

                    if (typeof this.initElevatorDownId != "undefined")
                        if (e.id === this.initElevatorDownId)
                            this.elevatorDown = e;
                }.bind(this))
            }.bind(this))


        }.bind(this))




        this.drawElement = drawJS.addElevatorElement(this);
    }

    this.ToJSON = function () {
        j = {
            id:this.id,
            x:this.x,
            y:this.y,
            direction:this.direction * Math.PI / 180,

        }

        if (this.elevatorDown)
            j["elevator_down_id"] = this.elevatorDown.id
        if (this.elevatorUp)
            j["elevator_up_id"] = this.elevatorUp.id
        return j;
    }

}


Furniture = function(room,jsonDataFurniture)
{
    this.room = room;

    this.id = jsonDataFurniture.id;
    this.x1 = jsonDataFurniture.x1;
    this.x2 = jsonDataFurniture.x2;
    this.y1 = jsonDataFurniture.y1;
    this.y2 = jsonDataFurniture.y2;

    if ("name" in jsonDataFurniture)
        this.name = jsonDataFurniture.name;
    else
        this.name = "";


    this.ToJSON = function () {
        j = {
            id:this.id,
            x1:this.x1,
            x2:this.x2,
            y1:this.y1,
            y2:this.y2
        }


        if (this.name)
            j["name"] = this.name;

        return j;
    }


    this.drawElement = drawJS.addFurnitureElement(this);
}

Graph = function(scheme,jsonDataGraph)
{
    this.scheme = scheme;

    this.nodes = jsonDataGraph.nodes.map(function (n) {
        return new Node(this,n);
    }.bind(this));

    this.edges = jsonDataGraph.edges.map(function (e) {
        return new Edge(this,e);
    }.bind(this));

    this.nodes.forEach(function (n) {
        n.SetLinks();
    }.bind(this));

    this.edges.forEach(function (e) {
        e.SetLinks();
    }.bind(this));


    this.ToJSON = function () {
        j = {
            edges : this.edges.map(function (e) {
                return e.ToJSON();
            }),
            nodes : this.nodes.map(function (n) {
                return n.ToJSON();
            })
        }

        return j;
    }

}

Edge = function(graph,jsonDataEdge)
{
    this.graph = graph;

    this.id = jsonDataEdge.id;

    this.weight = jsonDataEdge.weight;

    this.node1 = null;
    this.node2 = null;

    this.initNode1Id = jsonDataEdge.node1_id;
    this.initNode2Id = jsonDataEdge.node2_id;

    this.SetLinks = function () {
        this.graph.nodes.forEach(function (n) {
            if (n.id === this.initNode1Id)
                this.node1 = n;
            if (n.id === this.initNode2Id)
                this.node2 = n;

        }.bind(this));


        this.drawElement = drawJS.addEdgeElement(this);
    }


    this.ToJSON = function () {
        j = {
            id:this.id,
            node1_id:this.node1.id,
            node2_id:this.node2.id,
            weight:this.weight
        }




        return j;
    }



    this.destroy = function() {
        drawJS.destroyElement(this);

    }
}

Node = function(graph,jsonDataNode) {

    this.graph = graph;


    this.id = jsonDataNode.id;
    this.x = jsonDataNode.x;
    this.y = jsonDataNode.y;

    if ("direction" in jsonDataNode)
        this.direction = jsonDataNode.direction / Math.PI * 180;
    else
        this.direction = null;

    this.objType = jsonDataNode.obj_type;

    this.initFloorId = jsonDataNode.floor_id;
    this.initObjId = jsonDataNode.obj_id;

    this.obj = null;

    this.SetLinks = function () {
        this.graph.scheme.floors.forEach(function (f) {
            if (f.id === this.initFloorId)
                this.floor = f;



        }.bind(this));

        this.floor.rooms.forEach(function (r) {

            if (this.obj)
                return;

            if (this.objType==="in_room" && r.id===this.initObjId)
                this.obj = r;

            if (this.objType==="qr")
                r.qrs.forEach(function (q) {
                    if (q.id===this.initObjId)
                        this.obj = q;
                }.bind(this))

            if (this.objType==="staircase")
                r.staircases.forEach(function (s) {
                    if (s.id===this.initObjId)
                        this.obj = s;
                }.bind(this))

            if (this.objType==="elevator")
                r.elevators.forEach(function (e) {
                    if (e.id===this.initObjId)
                        this.obj = e;
                }.bind(this))


        }.bind(this))

        if (this.objType==="door")
            this.floor.doors.forEach(function (d) {
                 if (d.id===this.initObjId)
                    this.obj = d;

            }.bind(this))





        this.drawElement = drawJS.addNodeElement(this);
    }


    this.ToJSON = function () {
        j = {
            id:this.id,
            x:this.x,
            y:this.y,
            floor_id:this.floor.id
        }

        if (this.direction)
            j["direction"] = this.direction / 180 * Math.PI;



        return j;
    }


    this.move = function (index,dx,dy) {


        this.x+=dx;
        this.y+=dy;




    }


    this.destroy = function() {
        drawJS.destroyElement(this);

    }

}

Door = function(floor,jsonDataDoor)
{
    this.floor = floor;



    this.id = jsonDataDoor.id;
    if (this.id>maxDoorId)
        maxDoorId = this.id;

    this.x1 = jsonDataDoor.x1;
    this.x2 = jsonDataDoor.x2;
    this.y1 = jsonDataDoor.y1;
    this.y2 = jsonDataDoor.y2;
    this.width = jsonDataDoor.width;
    this.initWall1Id = jsonDataDoor.wall1_id;
    this.initWall2Id = jsonDataDoor.wall2_id;

    this.initRoom1Id = jsonDataDoor.room1_id;
    this.initRoom2Id = jsonDataDoor.room2_id;

    this.SetLinks = function () {

        this.floor.rooms.forEach(function (room) {
            if (room.id ===this.initRoom1Id)
            {
                this.room1 = room;
                room.walls.forEach(function (wall) {
                    if (wall.id === this.initWall1Id)
                        this.wall1 = wall;
                }.bind(this));
            }

            if (room.id ===this.initRoom2Id)
            {
                this.room2 = room;
                room.walls.forEach(function (wall) {
                    if (wall.id === this.initWall2Id)
                        this.wall2 = wall;
                }.bind(this));
            }

        }.bind(this));


        drawJS.addDoorElement(this);

    }



    this.move = function (index,dx,dy) {

        if (index===0 || index ===1 )
        {
            this.x1+=dx;
            this.y1+=dy;

        }

        if (index===0 || index ===2 )
        {
            this.x2+=dx;
            this.y2+=dy;
        }



    }


    this.ToJSON = function () {
        j = {
            id : this.id,
            x1 : this.x1,
            x2 : this.x2,
            y1 : this.y1,
            y2 : this.y2,
            width : this.width,
            wall1_id : this.initWall1Id,//this.wall1.id,
            wall2_id : this.initWall2Id,//this.wall2_id,
            room1_id : this.room1_id,
            room2_id : this.room2_id
        };
        return j;
    }
}

Wall = function(room,jsonDataWall)
{

    this.room = room;

    this.id = jsonDataWall.id;

    if (this.id>maxWallId)
        maxWallId = this.id;

    this.x1 = jsonDataWall.x1;
    this.x2 = jsonDataWall.x2;
    this.y1 = jsonDataWall.y1;

    this.y2 = jsonDataWall.y2;

    this.initPrevWallId = jsonDataWall.wall_prev_id;
    this.initNextWallId = jsonDataWall.wall_next_id;

    this.nextWall = null;
    this.prevWall = null;



    this.SetLinks = function () {
        this.room.walls.forEach(function (otherW) {
            if (otherW.id === this.initNextWallId)
                this.nextWall = otherW;

            if (otherW.id === this.initPrevWallId)
                this.prevWall = otherW;

        }.bind(this))
    }


    this.ToJSON = function () {
        j = {
            id:this.id,
            x1:this.x1,
            x2:this.x2,
            y1:this.y1,
            y2:this.y2,
            wall_prev_id:this.prevWall.id,
            wall_next_id:this.nextWall.id,
        }

        return j;
    }


    this.move = function (index,dx,dy) {

        if (index===0 || index ===1 )
        {
            this.x1+=dx;
            this.y1+=dy;

            this.prevWall.x2+=dx;
            this.prevWall.y2+=dy;
        }

        if (index===0 || index ===2 )
        {
            this.x2+=dx;
            this.y2+=dy;

            this.nextWall.x1+=dx;
            this.nextWall.y1+=dy;
        }



    }

    this.drawElement = drawJS.addWallElement(this);



}

Room = function(floor,jsonDataRoom)
{

    console.log("?")
    console.log(floor);

    this.floor = floor;
    this.id = jsonDataRoom.id;



    if (this.id>maxRoomId)
        maxRoomId = this.id;




    this.name = jsonDataRoom.name;
    this.description = jsonDataRoom.description;
    this.canSearch = jsonDataRoom.can_search;

    this.walls = jsonDataRoom.walls.map(function (w) {
        return new Wall(this,w);
    }.bind(this));



    console.log(jsonDataRoom.elevators)

    this.elevators = jsonDataRoom.elevators.map(function (e) {
        return new Elevator(this,e);
    }.bind(this));
    console.log(this.elevators)




    this.staircases = jsonDataRoom.staircases.map(function (s) {
        return new Staircase(this,s);
    }.bind(this));

    this.furniture = jsonDataRoom.furniture.map(function (f) {
        return new Furniture(this,f);
    }.bind(this));


    this.qrs = jsonDataRoom.qrs.map(function (q) {
        return new QR(this,q);
    }.bind(this));

    //console.log(this.walls);

    this.x = 0;
    this.y = 0;
    this.walls.forEach(function (w) {
        w.SetLinks();

        this.x+=(w.x1+w.x2)/2;
        this.y+=(w.y1+w.y2)/2;
    }.bind(this))

    this.x/=this.walls.length;
    this.y/=this.walls.length;



    this.SetLinks = function () {

        this.staircases.forEach(function (s) {
            s.SetLinks();
        }.bind(this))


        this.elevators.forEach(function (e) {
            e.SetLinks();
        }.bind(this))


        this.qrs.forEach(function (q) {
            q.SetLinks();
        }.bind(this))
    }

    this.ToJSON = function () {
        j = {
            id : this.id,
            name : this.name,
            description : this.description,
            can_search : this.canSearch,
            walls :  this.walls.map(function (w) {
                return w.ToJSON();
            }),
            elevators : this.elevators.map(function (e) {
                return e.ToJSON();
            }),
            furniture : this.furniture.map(function (f) {
                return f.ToJSON();
            }),
            staircases : this.staircases.map(function (s) {
                return s.ToJSON();
            }),
            qrs : this.qrs.map(function (q) {
                return q.ToJSON();
            })
        }

        return j;
    }


    this.drawElement = drawJS.addRoomElement(this);

    this.move = function (index,dx,dy) {
        this.x+=dx;
        this.y+=dy;


        this.walls.forEach(function (w) {
            w.x1+=dx;
            w.x2+=dx;

            w.y1+=dy;
            w.y2+=dy;
        })

        this.furniture.forEach(function (f) {
            f.x1+=dx;
            f.y1+=dy;
            f.x2+=dx;
            f.y2+=dy;
        })

        this.elevators.forEach(function (e) {
            e.x+=dx;
            e.y+=dy;
        })

        this.staircases.forEach(function (s) {
            s.x+=dx;
            s.y+=dy;
        })

        this.qrs.forEach(function (q) {
            q.x+=dx;
            q.y+=dy;
        })

        this.floor.doors.forEach(function (d) {

            if (d.room1===this)
            {
                d.x1+=dx;
                d.y1+=dy;
            }
            else if (d.room2===this)
            {
                d.x2+=dx;
                d.y2+=dy;
            }
        }.bind(this))



        this.floor.scheme.graph.nodes.forEach(function (n) {
            if (n.obj===this)
            {
                n.x+=dx;
                n.y+=dy;

            }
            else if (n.objType === "qr" || n.objType === "elevator" || n.objType === "staircase")
            {
                if (n.obj.room === this)
                {
                    n.x+=dx;
                    n.y+=dy;
                }
            } else if (n.objType === "door")
            {
                if (n.obj.room1 === this || n.obj.room2 === this)
                {
                    n.x+=dx/2;
                    n.y+=dy/2;
                }
            }


        }.bind(this))
    }


}

Floor = function(scheme,jsonDataFloor)
{

    this.scheme = scheme;
    this.id = jsonDataFloor.id;

    if (this.id>maxFloorId)
        maxFloorId = this.id;



    this.x = (this.id-1)*14;
    this.y = (this.id-1)*3;

    this.name = jsonDataFloor.name;


    this.rooms = jsonDataFloor.rooms.map(function (r) {
        return new Room(this,r);
    }.bind(this));

    this.doors = jsonDataFloor.doors.map(function (d) {
        return new Door(this,d);
    }.bind(this))


    this.SetLinks = function () {
        this.rooms.forEach(function (r) {
            r.SetLinks();
        })

        this.doors.forEach(function (d) {
            d.SetLinks();
        })
    }




    this.ToJSON = function () {
        j = {
            id: this.id,
            name: this.name,
            rooms: this.rooms.map(function (r) {
                return r.ToJSON();
            }),

            doors: this.doors.map(function (d) {
                return d.ToJSON();
            })


        }

        return j;
    }

    this.move = function (index,dx,dy) {
        this.x+=dx;
        this.y+=dy;
    }

    this.drawElement = drawJS.addFloorElement(this);

}

Scheme = function(jsonDataScheme)
{
    //cacheMapData = jsonData;



    this.id = jsonDataScheme.id;
    this.name = jsonDataScheme.name;
    this.address = jsonDataScheme.address;
    this.description = jsonDataScheme.description;





    this.floors = jsonDataScheme.floors.map(function (f) {

        return new Floor(this,f);
    }.bind(this));

    this.floors.forEach(function (f) {
        f.SetLinks();
    })


    this.graph = new Graph (this,jsonDataScheme.graph);




    this.SetID = function (id) {
        //cacheMapData.id = id;
        this.id = id;
    }

    this.ToJSON = function () {

        j = {
            id:this.id,
            name:this.name,
            address:this.address,
            description:this.description,
            graph:this.graph.ToJSON(),
            floors:this.floors.map(function (f) {
                return f.ToJSON();
            })
        }

        return j;
        //return cacheMapData;
    }

    this.GetFloors = function () {
        return this.floors;
    }

    this.GetRooms = function () {
        rs = [];
        this.floors.forEach(function (f) {
            f.rooms.forEach(function (r) {
                rs.push(r);
            })
        })
        return rs;
    }

    this.GetDoors = function () {
        ds = [];
        this.floors.forEach(function (f) {
            f.doors.forEach(function (d) {
                ds.push(d);
            })
        })
        return ds;
    }



}
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
    console.log(currParamObject)

    if (type==="scheme")
    {
       document.getElementById("p_scheme_id").value = currParamObject.id;
        document.getElementById("p_scheme_name").value = currParamObject.name;
        document.getElementById("p_scheme_address").value = currParamObject.address;
        document.getElementById("p_scheme_description").value = currParamObject.description;
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
    MAXSCHEMEID++;
    SEARCH_SCHEME_ID = MAXSCHEMEID;
    scheme.SetID(MAXSCHEMEID);
    uploadScheme(MAXSCHEMEID,scheme.ToJSON());
    document.getElementById("requestIdBox" ).value = MAXSCHEMEID;

    document.getElementById("p_scheme_id" ).value = MAXSCHEMEID;
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
        url: '/scheme/'+id,
        data: JSON.stringify(scheme),
        contentType: "application/json",
        dataType: "json"
    }).done(function() {

    }).fail(function() {

    })
}

maxFloorId = 0;
maxRoomId = 0;
maxWallId = 0;
maxDoorId = 0;
maxQRId = 0;
function setCurrentScheme(jsonMap)
{
    maxFloorId = 0;
    maxRoomId = 0;
    maxWallId = 0;
    maxDoorId = 0;
    maxQRId = 0;



    drawJS.init();

    scheme = new Scheme(jsonMap);


    showParams("scheme",scheme);


    console.log(maxRoomId);




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

    scheme.floors.forEach(function (f) {

        f.rooms.forEach(function (r) {
            let xx =0;
            let yy =0;
            r.walls.forEach(function (w) {
                xx+=w.x1;
                yy+=w.y1;
            })

            xx = xx/r.walls.length;
            yy = yy/r.walls.length;

            p = new Node(scheme.graph,{
                id:maxNodeId++,
                x:xx,
                y:yy,
                obj_type:"in_room",
                obj_id:r.id,
                floor_id:f.id
            })
            scheme.graph.nodes.push(p);
            p.SetLinks();




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


                var r_node = null
                scheme.graph.nodes.forEach(function (n) {
                    if (n.objType==="in_room" && el.room && n.obj.id ===el.room.id)
                        r_node = n;
                })


                if (r_node)
                {
                    dist = Math.sqrt(Math.pow(r_node.x-xx,2)+Math.pow(r_node.y-yy,2))


                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:p.id,
                        node2_id:r_node.id,
                        weight:dist
                    })


                    scheme.graph.edges.push()
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


                var r_node = null
                scheme.graph.nodes.forEach(function (n) {
                    if (n.objType==="in_room" && st.room && n.obj.id ===st.room.id)
                        r_node = n;
                })


                if (r_node)
                {
                    dist = Math.sqrt(Math.pow(r_node.x-xx,2)+Math.pow(r_node.y-yy,2))


                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:p.id,
                        node2_id:r_node.id,
                        weight:dist
                    })


                    scheme.graph.edges.push()
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





            var r1_node = null
            var r2_node = null
            scheme.graph.nodes.forEach(function (n) {
                if (n.objType==="in_room" && d.room1 && n.obj.id ===d.room1.id)
                    r1_node = n;
                if (n.objType==="in_room" && d.room2 && n.obj.id ===d.room2.id)
                    r2_node = n;
            })


            if (r1_node)
            {
                dist = Math.sqrt(Math.pow(r1_node.x-xx,2)+Math.pow(r1_node.y-yy,2))


                e = new Edge(scheme.graph,{
                    id:maxEdgeId++,
                    node1_id:p.id,
                    node2_id:r1_node.id,
                    weight:dist
                })


                scheme.graph.edges.push()
                e.SetLinks();

            }

            if (r2_node)
            {
                dist = Math.sqrt(Math.pow(r2_node.x-xx,2)+Math.pow(r2_node.y-yy,2))


                e = new Edge(scheme.graph,{
                    id:maxEdgeId++,
                    node1_id:p.id,
                    node2_id:r2_node.id,
                    weight:dist
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

                console.log(s);
                if (s.staircaseDown!= null && s.staircaseDown.id<s.id)
                {
                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:n1.id,
                        node2_id:nDown.id,
                        weight:15
                    })


                    scheme.graph.edges.push()
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

                    scheme.graph.edges.push()
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

                console.log(el);
                if (el.elevatorDown!= null && el.elevatorDown.id<el.id)
                {
                    e = new Edge(scheme.graph,{
                        id:maxEdgeId++,
                        node1_id:n1.id,
                        node2_id:nDown.id,
                        weight:15
                    })


                    scheme.graph.edges.push()
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

                    scheme.graph.edges.push()
                    e.SetLinks();
                }
            })
        })


    })
/*


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


        //console.log(nds)

        for (let i=1;i<Math.min(3,nds.length);i++)
        {
            //console.log(i)
            edges.push({
                "id":e_id,
                "node1":new_node,
                "node2":nds[i].node,
                "weight":nds[i].dist
            })
            e_id+=1
        }







    })*/



}



function newRoom() {
    waitingToCreate = "room";
    drawJS.askInput(["floor"],"Adding new room. Please select:",["Floor"]);


}

function newFloor() {

    waitingToCreate = "floor";

    mainCreate(null)
}

function newDoor() {
    waitingToCreate = "door";
    drawJS.askInput(["room","room"],"Adding new door. Please select:",["Room 1","Room 2"])



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