maxFloorId = 0;
maxRoomId = 0;
maxWallId = 0;
maxDoorId = 0;
maxQRId = 0;
maxFurnitureId = 0;


QR = function(room,jsonDataQR)
{
    this.room = room;

    this.id = jsonDataQR.id;

    if (this.id>maxQRId)
        maxQRId = this.id;



    this.x = jsonDataQR.x;
    this.y = jsonDataQR.y;

    this.name = jsonDataQR.name;
    this.canSearch = jsonDataQR.can_search;


    this.initWallId = jsonDataQR.wall_id;

    this.direction = jsonDataQR.direction / Math.PI * 180;

    this.SetLinks = function () {
        if (DrawJS)
            this.drawElement = DrawJS.AddQRElement(this);
    }


    this.ToJSON = function () {
        j = {
            id:this.id,
            x:this.x,
            y:this.y,
            name:this.name,
            can_search: this.canSearch,
            wall_id:this.initWallId,
            direction:this.direction * Math.PI / 180
        }

        return j;
    }


    this.move = function (index,dx,dy) {
        this.x += dx;
        this.y += dy;
    }

    this.destroy = function(deep) {
        DrawJS.DestroyElement(this);

        if (deep)
        {
            let index = $.inArray(this, this.room.qrs);
            if (index !== -1) {
                this.room.qrs.splice(index, 1);
            }


            index = -1;
            let nodes = this.room.floor.scheme.graph.nodes;
            for (let i=0;i<nodes.length;i++)
                if (nodes[i].obj === this)
                    index = i;

            if (index!==-1)
            {
                nodes[index].destroy(true);
                nodes.splice(index,1);
            }


        }



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

   // console.log(this.initStaircaseDownId,this.initStaircaseUpId);

    this.staircaseUp = null;
    this.staircaseDown = null;

    this.SetLinks = function () {



        this.room.floor.scheme.floors.forEach(function (f) {

            f.rooms.forEach(function (r) {
                r.staircases.forEach(function (s) {
                    //console.log(s.id,this.initStaircaseUpId,this.initStaircaseDownId)

                    if (typeof this.initStaircaseUpId != "undefined")
                        if (s.id === this.initStaircaseUpId)
                            this.staircaseUp = s;

                    if (typeof this.initStaircaseDownId != "undefined")
                        if (s.id === this.initStaircaseDownId)
                            this.staircaseDown = s;
                }.bind(this))
            }.bind(this))
        }.bind(this))

        //console.log("AFTER")
       // console.log(this)


        if (DrawJS)
            this.drawElement = DrawJS.AddStaircaseElement(this);
    }

    this.ToJSON = function () {
        j = {
            id:this.id,
            x:this.x,
            y:this.y,
            width:this.width,
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



        if (DrawJS)
            this.drawElement = DrawJS.AddElevatorElement(this);
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

    if (this.id>maxFurnitureId)
        maxFurnitureId = this.id;

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

    if (DrawJS)
        this.drawElement = DrawJS.AddFurnitureElement(this);


    this.move = function (index,dx,dy) {

        if (index===0 || index===1)
        {
            this.x1 += dx;
            this.y1 += dy;
        }
        if (index===0 || index===2)
        {
            this.x2 += dx;
            this.y2 += dy;
        }



    }
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

        if (DrawJS)
            this.drawElement = DrawJS.AddEdgeElement(this);
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



    this.destroy = function(deep) {
        DrawJS.DestroyElement(this);

        if (deep)
        {
            index = -1;
            let edges = this.graph.edges;
            for (let i=0;i<edges.length;i++)
                if (edges[i].obj === this)
                    index = i;

            if (index!==-1)
            {
                edges[index].destroy(true);
                edges.splice(index,1);
            }
        }

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




        if (DrawJS)
            this.drawElement = DrawJS.AddNodeElement(this);
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


    this.destroy = function(deep) {
        DrawJS.DestroyElement(this);


        if (deep)
        {
            let edgesToDestroy = [];


            for (let i =0;i<this.graph.edges.length;i++)
            {
                if (this.graph.edges[i].node1===this || this.graph.edges[i].node2===this)
                    edgesToDestroy.push(this.graph.edges[i]);
            }

            edgesToDestroy.forEach(function (e) {

                e.destroy(true);



            })
        }



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

        this.room1 = null;
        this.room2 = null;

        this.wall1 = null;
        this.wall2 = null;

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


        if (DrawJS)
            DrawJS.AddDoorElement(this);

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
            wall1_id : this.wall1 ? this.wall1.id : null,
            wall2_id : this.wall2 ? this.wall2.id : null,
            room1_id : this.room1 ? this.room1.id : null,
            room2_id : this.room2 ? this.room2.id : null
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

    if (DrawJS)
        this.drawElement = DrawJS.AddWallElement(this);



}

Room = function(floor,jsonDataRoom)
{

   // console.log("?")
    //console.log(floor);

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



   // console.log(jsonDataRoom.elevators)

    this.elevators = jsonDataRoom.elevators.map(function (e) {
        return new Elevator(this,e);
    }.bind(this));
  //  console.log(this.elevators)




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


    if (DrawJS)
        this.drawElement = DrawJS.AddRoomElement(this);

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

    if (DrawJS)
        this.drawElement = DrawJS.AddFloorElement(this);

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