



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



    this.LoadSchemeInfo = function(id,f)
    {
        BackendJS.LoadSchemeInfo(id,f);
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

        this.maxFloorId = 0;
        this.maxRoomId = 0;
        this.maxWallId = 0;
        this.maxDoorId = 0;
        this.maxQRId = 0;
        this.maxFurnitureId = 0;
        this.maxElevatorId = 0;
        this.maxStaircaseId = 0;

        DrawJS.Init();


        try
        {
            this.scheme = new Scheme(jsonMap,this);
            this.ShowParams("scheme",this.scheme);
            DrawJS.UpdateCanvas();
            InterfaceJS.UpdateFloorList(this.scheme.floors);
        }
        catch (e) {

            InterfaceJS.ShowErrorMessage("JSON не соответсвует формату схемы навигации")
            this.NewFile();
        }




    }

    this.LoadScheme = function(id) {
        BackendJS.LoadScheme(id,function (scheme) {
            this.SetScheme(scheme);
            }.bind(this),
            function (e) {
            console.log(e);
        });
    }


    this.CheckScheme = function () {



            if (this.scheme.floors.length<1)
                throw {message:"Пустой план здания"}




            let usedQrIds = {}
            this.scheme.graph.nodes.forEach(function (n) {
                if (n.objType==="qr")
                    usedQrIds[n.obj.id] = n;

            })

            this.scheme.floors.forEach(function (f) {
                let qrNums = 0;

                //if (f.rooms.length<1)
                //    throw {message:f.name+": На этаже отсутсвуют комнаты"}

                f.rooms.forEach(function (r) {
                    r.qrs.forEach(function (q) {
                        qrNums+=1;

                        if (! (q.id in usedQrIds) && this.scheme.graph.nodes.length>0)
                            throw {message:"QR-код "+q.id+" не привязан к графу. Сгенерируйте граф заново"}
                    }.bind(this))
                }.bind(this))

                if (qrNums===0 && f.rooms.length>0)
                    throw {message:f.name+": На этаже отсутствуют QR-метки"}
            }.bind(this))



        if (this.scheme.graph.nodes.length<1)
            throw {message:"Не сгенерирован граф навигации"}




    }

    this.UploadScheme = function () {
        BackendJS.UploadScheme(this.scheme.ToJSON(),function (id) {

            //InterfaceJS.SetSearchSchemeId(id)

            //InterfaceJS.UpdateParams("scheme",this.scheme);
            this.scheme.id = id;

            InterfaceJS.OpenWindow('scheme_uploaded');




        }.bind(this), function (e) {
            console.log(e);
        });

    }

    this.SetSelectedObjectParam = function (param,value) {

        this.currentParamObject[param] = value;


        if (this.currentParamObject instanceof Floor)
            InterfaceJS.UpdateFloorList(this.scheme.floors);


        DrawJS.UpdateCanvas();
    }
    this.DestroySelectedObject = function () {


        if (this.currentParamObject.destroy)
        {


            this.currentParamObject.destroy(true);
            this.currentParamObject = null;


            InterfaceJS.ShowParams("scheme",null);
        }


    }

    this.RemovePortalLink = function (type,dir) {


        let tDir = type+(dir==="up"? "Up":"Down");
        let oDir = type+(dir==="up"? "Down":"Up");

        if (this.currentParamObject[tDir])
            {
                this.currentParamObject[tDir][oDir] = null;
                this.currentParamObject[tDir] = null;
            }


        DrawJS.UpdateCanvas();
    }

    this.ChangePortalLink = function (type,dir) {
        this.RemovePortalLink(type,dir);


        this.waitingToCreate = type+"_"+dir+"_link";


        DrawJS.AskInput([type],
            "Добавляем связь между "+(type==="elevator"?"лифтами":"лестницами")+". Пожалуйста, выберите: ",
            [(type==="elevator"?"Лифт":"Лестницу")+" "+(dir==="up"?"выше":"ниже")]);



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

        if (typeof id==="undefined")
            id = this.scheme.id
        BackendJS.OpenSchemeQRPDF(id);
    }

    this.OpenSchemeHelpPDF = function(id) {
        if (typeof id==="undefined")
            id = this.scheme.id
        BackendJS.OpenSchemeHelpPDF(id);
    }

    this.MainCreate = function (data) {
        if (this.waitingToCreate==="floor")
        {
            this.maxFloorId+=1;
            let f = new Floor(this.scheme,{
                id:this.maxFloorId,
                name:"Этаж ("+this.maxFloorId+")",
                rooms:[],
                doors:[]
            },this)

            this.scheme.floors.push(f);


            InterfaceJS.UpdateFloorList(this.scheme.floors);
        }
        else if (this.waitingToCreate==="room")
        {
            // 0 - floor
            if (data[0]!==null)
            {
                this.maxRoomId+=1;
                this.maxWallId+=4;
                let cx = -2+Math.round(Math.random()*6);
                let cy = 5+Math.round(Math.random()*6);
                r = new Room(data[0],{
                    id:this.maxRoomId,
                    name:"Комната",
                    description:"",
                    can_search: true,
                    elevators:[],
                    staircases:[],
                    furniture:[],
                    qrs:[],
                    walls:[
                        {"id":this.maxWallId-3,"x1":cx+2,"y1":cy-4,"x2":cx+5,"y2":cy-4,    "wall_prev_id":this.maxWallId,"wall_next_id":this.maxWallId-2},
                        {"id":this.maxWallId-2,"x1":cx+5,"y1":cy-4,"x2":cx+5,"y2":cy-7,     "wall_prev_id":this.maxWallId-3,"wall_next_id":this.maxWallId-1},
                        {"id":this.maxWallId-1,"x1":cx+5,"y1":cy-7,"x2":cx+2,"y2":cy-7,     "wall_prev_id":this.maxWallId-2,"wall_next_id":this.maxWallId},
                        {"id":this.maxWallId,"x1":cx+2,"y1":cy-7,"x2":cx+2,"y2":cy-4,      "wall_prev_id":this.maxWallId-1,"wall_next_id":this.maxWallId-3}

                    ]
                },this)
                data[0].rooms.push(r);
            }

        }
        else if (this.waitingToCreate==="door")
        {
            // 0 - wall1
            // 1 - wall2
            if (data[0]!==null && data[1]!==null)
            {
                if (data[0].room.floor!== data[1].room.floor)
                    return;

                if (data[0].room === data[1].room)
                    return;

                this.maxDoorId+=1;

                var f = data[0].room.floor;
                var w1 = data[0];
                var w2 = data[1];



                /*
                var w1 = r1.walls.reduce(function(prev, curr) {
                    return (Math.sqrt(Math.pow((curr.x1+curr.x2)/2-r2.x,2)+Math.pow((curr.y1+curr.y2)/2-r2.y,2))
                    < Math.sqrt(Math.pow((prev.x1+prev.x2)/2-r2.x,2)+Math.pow((prev.y1+prev.y2)/2-r2.y,2))
                        ? curr : prev);
                });

                var w2 = r2.walls.reduce(function(prev, curr) {
                    return (Math.sqrt(Math.pow((curr.x1+curr.x2)/2-r1.x,2)+Math.pow((curr.y1+curr.y2)/2-r1.y,2))
                    < Math.sqrt(Math.pow((prev.x1+prev.x2)/2-r1.x,2)+Math.pow((prev.y1+prev.y2)/2-r1.y,2))
                        ? curr : prev);
                });*/



                d = new Door(f,{
                    id:this.maxDoorId,
                    x1:(w1.x1+w1.x2)/2,
                    y1:(w1.y1+w1.y2)/2,
                    x2:(w2.x1+w2.x2)/2,
                    y2:(w2.y1+w2.y2)/2,
                    room1_id: w1.room.id,
                    room2_id: w2.room.id,
                    wall1_id: w1.id,
                    wall2_id: w2.id,
                    width:0.9
                },this)

                f.doors.push(d);

                d.SetLinks();
            }

        }
        else if (this.waitingToCreate==="qr")
        {
            // 0 - wall

            if (data[0]!==null)
            {
                this.maxQRId+=1;

                var r = data[0].room;
                var w = data[0];


                let dir = Math.atan2(w.y2-w.y1,w.x2-w.x1) + Math.PI/2;

                if (dir<0)
                    dir +=Math.PI*2;

                if (dir>Math.PI*2)
                    dir -= Math.PI*2;

                let rr = 0.25+0.5*Math.random()

                var q = new QR(r,{
                    id:this.maxQRId,
                    can_search:false,
                    name:"",
                    x : w.x1+(w.x2-w.x1)*rr,
                    y : w.y1+(w.y2-w.y1)*rr,
                    direction:dir,
                    wall_id:w.id
                },this)

                r.qrs.push(q)

                q.SetLinks();
            }

        }
        else if (this.waitingToCreate==="wall")
        {

            // 0 - wall
            if (data[0]!==null)
            {
                this.maxWallId+=1;

                let r = data[0].room;
                let selectedWall = data[0];
                let nextWall = data[0].nextWall;

                let newWall = new Wall(r,{
                    id:this.maxWallId,
                    x1 : (selectedWall.x1+selectedWall.x2)/2,
                    y1 : (selectedWall.y1+selectedWall.y2)/2,
                    x2 : selectedWall.x2,
                    y2 : selectedWall.y2,
                    wall_prev_id : selectedWall.id,
                    wall_next_id : nextWall.id
                },this);

                selectedWall.x2 = (selectedWall.x1+selectedWall.x2)/2;
                selectedWall.y2 = (selectedWall.y1+selectedWall.y2)/2;
                selectedWall.nextWall = newWall;
                nextWall.prevWall = newWall;


                r.walls.push(newWall);

                newWall.SetLinks();


                r.qrs.forEach(function (q){q.move(0,0,0,false)});
                r.elevators.forEach(function (e){e.move(0,0,0,false)});
                r.floor.doors.forEach(function (d) {
                    if (d.wall1===selectedWall || d.wall2===selectedWall)
                        d.move(0,0,0,false);
                })


            }




        }
        else if (this.waitingToCreate==="furniture")
        {
            // 0 - room
            if (data[0]!==null)
            {
                this.maxFurnitureId+=1;

                let r = data[0];

                let xx =0;
                let yy=0;
                r.walls.forEach(function (w) {

                    xx+=w.x1;
                    yy+=w.y1;
                })
                xx/=r.walls.length;
                yy/=r.walls.length;

                xx+=Math.round(Math.random()*2);
                yy+=Math.round(Math.random()*2);



                let ff = new Furniture(r,{
                    id:this.maxFurnitureId,
                    name:"",
                    x1:xx-0.5,
                    y1:yy+0.5,
                    x2:xx+0.5,
                    y2:yy-0.5
                },this);



                r.furniture.push(ff);
            }



        }
        else if (this.waitingToCreate==="elevator")
        {
            // 0 - wall
            // 1 - elevator low
            // 2 - elevator up

            if (data[0]!==null)
            {
                this.maxElevatorId+=1

                let r = data[0].room;
                let w = data[0];


                let eLow = data[1];
                let eUp = data[2];

                if (eLow && eLow.room.floor === r.floor)
                    eLow = null;

                if (eUp && eUp.room.floor === r.floor)
                    eUp = null;

                if (eLow && eUp && eLow.room.floor === eUp.room.floor)
                    eUp = null;



                let dir = Math.atan2(w.y2-w.y1,w.x2-w.x1) + Math.PI/2;

                if (dir<0)
                    dir +=Math.PI*2;

                if (dir>Math.PI*2)
                    dir -= Math.PI*2;


                let jData = {
                    id:this.maxElevatorId,
                    x : w.x1+(w.x2-w.x1)*0.7,
                    y : w.y1+(w.y2-w.y1)*0.7,
                    direction:dir,
                    wall_id:w.id
                }





                if (eLow!==null)
                {
                    jData['elevator_down_id'] = eLow.id;

                }


                if (eUp!==null)
                {
                    jData['elevator_up_id'] = eUp.id;

                }

                let e = new Elevator(r,jData,this)


                if (eLow!==null)
                {
                    eLow.elevatorUp = e;
                }


                if (eUp!==null)
                {
                    eUp.elevatorDown = e;

                }

                r.elevators.push(e)

                e.SetLinks();
            }
        }
        else if (this.waitingToCreate==="staircase")
        {
            // 0 - room
            // 1 - staircase low
            // 2 - staircase up

            if (data[0]!==null)
            {
                this.maxStaircaseId+=1

                let r = data[0];

                let sLow = data[1];
                let sUp = data[2];

                if (sLow && sLow.room.floor === r.floor)
                    sLow = null;

                if (sUp && sUp.room.floor === r.floor)
                    sUp = null;

                if (sLow && sUp && sLow.room.floor === sUp.room.floor)
                    sUp = null;



                let jData = {
                    id:this.maxStaircaseId,
                    x : r.x+1,
                    y : r.y+1,
                    width : 1,
                    height : 2,
                    direction:0
                }




                if (sLow!==null)
                {
                    jData['staircase_down_id'] = sLow.id;

                }


                if (sUp!==null)
                {
                    jData['staircase_up_id'] = sUp.id;

                }

                let s = new Staircase(r,jData,this)


                if (sLow!==null)
                {
                    sLow.staircaseUp = s;
                }


                if (sUp!==null)
                {
                    sUp.staircaseDown = s;

                }

                r.staircases.push(s)

                s.SetLinks();
            }
        }
        else if (this.waitingToCreate==="staircase_up_link")
        {
            if (data[0]!==null && data[0]!==this.currentParamObject)
            {
                let os = data[0];
                let s = this.currentParamObject;

                if (os.staircaseDown)
                    os.staircaseDown.staircaseUp = null;
                os.staircaseDown = s;
                s.staircaseUp = os;
            }
        }
        else if (this.waitingToCreate==="staircase_down_link")
        {
            if (data[0]!==null && data[0]!==this.currentParamObject)
            {
                let os = data[0];
                let s = this.currentParamObject;

                if (os.staircaseUp)
                    os.staircaseUp.staircaseDown = null;
                os.staircaseUp = s;
                s.staircaseDown = os;
            }
        }
        else if (this.waitingToCreate==="elevator_up_link")
        {
            if (data[0]!==null && data[0]!==this.currentParamObject)
            {
                let oe = data[0];
                let e = this.currentParamObject;

                if (oe.elevatorDown)
                    oe.elevatorDown.elevatorUp = null;
                oe.elevatorDown = e;
                e.elevatorUp = oe;
            }
        }
        else if (this.waitingToCreate==="elevator_down_link")
        {
            if (data[0]!==null && data[0]!==this.currentParamObject)
            {
                let oe = data[0];
                let e = this.currentParamObject;

                if (oe.elevatorUp)
                    oe.elevatorUp.elevatorDown = null;
                oe.elevatorUp = e;
                e.elevatorDown = oe;
            }
        }

        DrawJS.UpdateCanvas();

    }


    this.ClearQR = function (floorId) {

        this.scheme.floors.forEach(function (f) {
            if (floorId===f.id || floorId===-1)
                f.rooms.forEach(function (r) {

                    let qc = [...r.qrs];

                    qc.forEach(function (q) {
                        q.destroy(true);
                    })
                    //r.qrs = [];
                })
        })
    }

    this.GenerateQR = function (floorId) {

        this.ClearQR(floorId);






        this.scheme.floors.forEach(function (f) {




            if (f.id === floorId || floorId===-1)
            {


                let walls = {};
                let wallToExitPosition = {};
                let qrToCreate = [];

                let addExit = function(wall,x,y,width) {
                    if (! (wall.id in wallToExitPosition))
                        wallToExitPosition[wall.id] = [];



                    let wPos = MyMath.pointOnSegment({x:x,y:y},{x:wall.x1,y:wall.y1}, {x:wall.x2,y:wall.y2})



                    wallToExitPosition[wall.id].push(
                        {
                            x : wPos.x,
                            y:  wPos.y,
                            k : MyMath.pointDistance({x:wall.x1,y:wall.y1},wPos)
                                / MyMath.pointDistance({x:wall.x1,y:wall.y1},{x:wall.x2,y:wall.y2}),
                            width : width
                        })

                    walls[wall.id] = wall;
                }

                f.doors.forEach(function (d) {


                    if (d.wall1)
                    {

                        addExit(d.wall1,d.x1,d.y1,d.width);


                    }

                    if (d.wall2)
                    {

                        addExit(d.wall2,d.x2,d.y2,d.width);

                    }



                }.bind(this));

                f.rooms.forEach(function (r) {
                    r.elevators.forEach(function (e) {


                        addExit(e.wall,e.x,e.y,1);
                    })
                }.bind(this));



                for (var key in wallToExitPosition)
                {
                    let w = walls[key];

                    let exits = wallToExitPosition[key]

                    exits.forEach(function (exit) {


                        let wall = w;
                        let posStart = exit.k+exit.width/wall.GetLength()/2;
                        let posEnd = 1;

                        let rightExit = null;

                        exits.forEach(function (otherExit) {
                            if (otherExit.k>exit.k && (rightExit===null || rightExit.k>otherExit.k)) rightExit = otherExit});


                        if (rightExit!==null)
                        {

                            posEnd = rightExit.k-rightExit.width/wall.GetLength()/2;
                        }
                        else
                        {
                            if ((posEnd-posStart)*wall.GetLength()<0.5)
                            {
                                wall = wall.nextWall;
                                posStart = 0;
                                rightExit = null;

                                if (wall.id in walls)
                                    wallToExitPosition[wall.id].forEach(function (otherExit)
                                    {if ((rightExit===null || rightExit.k>otherExit.k))
                                        rightExit = otherExit});
                                else
                                {
                                    posEnd = 0.2;
                                }


                                if (rightExit!==null)
                                {
                                    posEnd = rightExit.k-rightExit.width/wall.GetLength()/2;


                                    if (posEnd*2*wall.GetLength()<0.5)
                                        wall = null;
                                }




                            }
                        }










                        if (wall!==null)
                        {
                            this.maxQRId+=1;

                            let dir = Math.atan2(wall.y2-wall.y1,wall.x2-wall.x1) + Math.PI/2;
                            if (dir<0)
                                dir +=Math.PI*2;
                            if (dir>Math.PI*2)
                                dir -= Math.PI*2;

                            var q = new QR(wall.room,{
                                id:this.maxQRId,
                                name : "",
                                can_search : false,
                                x : wall.x1+(wall.x2-wall.x1)*(posStart+posEnd)/2,
                                y : wall.y1+(wall.y2-wall.y1)*(posStart+posEnd)/2,
                                direction:dir,
                                wall_id:wall.id
                            },this)

                            wall.room.qrs.push(q)
                            q.SetLinks();
                        }

                    }.bind(this))

                }
            }
        }.bind(this))



        DrawJS.UpdateCanvas();

    }




    this.NewFloor = function () {

        this.waitingToCreate = "floor";
        DrawJS.AskInput([],"",[])

    }


    this.NewRoom = function () {
        this.waitingToCreate = "room";
        DrawJS.AskInput(["floor"],"Добавляем новую комнату. Пожалуйста, выберите: ",["Этаж"]);

    }

    this.NewWall = function () {
        this.waitingToCreate = "wall";
        DrawJS.AskInput(["wall"],
            "Добавляем новую стену. Пожалуйста, выберите: ",
            ["Стену"])

    }

    this.NewDoor = function () {
        this.waitingToCreate = "door";
        DrawJS.AskInput(["wall","wall"],
            "Добавляем новую дверь. Пожалуйста, выберите: ",
            ["Стену 1","Стену 2"])

    }

    this.NewFurniture = function () {
        this.waitingToCreate = "furniture";
        DrawJS.AskInput(["room"],
            "Добавляем новую мебель/препятствие. Пожалуйста, выберите: ",
            ["Комнату"])


    }

    this.NewStaircase = function () {
        this.waitingToCreate = "staircase";
        DrawJS.AskInput(["room","staircase","staircase"],
            "Добавляем новую лестницу. Пожалуйста, выберите: ",
            ["Комнату",
                "Лестницу ниже\n(Правая кнопка мыши, если лестницы ниже нет)",
                "Лестницу выше\n(Правая кнопка мыши, если лестницы выше нет)"])

    }

    this.NewElevator = function () {
        this.waitingToCreate = "elevator";
        DrawJS.AskInput(["wall","elevator","elevator"],
            "Добавляем новый лифт. Пожалуйста, выберите: ",
            ["Стену",
                "Лифт ниже\n(Правая кнопка мыши, если лифта ниже нет)",
                "Лифт выше\n(Правая кнопка мыши, если лифта выше нет)"])

    }

    this.NewQR = function () {
        this.waitingToCreate = "qr";
        DrawJS.AskInput(["wall"],
            "Добавляем новую QR-метку. Пожалуйста, выберите: ",["Стену"]);


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

    this.SetHint = function (text) {
        InterfaceJS.SetHint(text);
    }

    this.CreateGraph = function (trType,full) {



        if (full)
            this.ClearGraph();

        var startTime = (new Date().getTime() / 1000);



        var maxNodeId = 0;
        var maxEdgeId = 0;

        var lastRoom = null;
        try
        {

            let scheme = this.scheme;


            scheme.floors.forEach(function (f) {




                f.rooms.forEach(function (r) {

                    lastRoom = r;





                    let contour = [];


                    //let xx =0;
                    //let yy =0;

                    let startWall = r.walls[0];
                    let w = startWall;

                    console.log('START MOVE');

                    consoleWithNoSource(r.id,r.name)
                    while (w.nextWall!==startWall)
                    {
                        consoleWithNoSource(w.x1, w.y1);
                        contour.push(new poly2tri.Point(w.x1, w.y1));

                        w = w.nextWall;
                    }
                    consoleWithNoSource(w.x1, w.y1);
                    contour.push(new poly2tri.Point(w.x1, w.y1));


                    var swctx = new poly2tri.SweepContext(contour);

                    //xx = xx/r.walls.length;
                    //yy = yy/r.walls.length;



                    let usedPoints = [];

                    let fixHolePoint = function(x,y,dx,dy) {
                        let v = {x:x,y:y};

                        let used = true;
                        while (used)
                        {

                            let usedX = false;
                            let usedY = false;

                            for (let i=0;i<usedPoints.length;i++)
                            {
                                if (usedPoints[i].x===v.x)
                                    usedX = true;
                                if (usedPoints[i].y===v.y)
                                    usedY = true;

                            }

                            used = usedX || usedY;

                            if (usedX)
                                v.x+=0.000001*dx;
                            if (usedY)
                                v.y+=0.000001*dy;
                        }


                        usedPoints.push(v);

                        return v;
                    }

                    r.furniture.forEach(function (f) {
                        consoleWithNoSource(' ');
                        consoleWithNoSource(f.x1, f.y1);
                        consoleWithNoSource(f.x2, f.y1);
                        consoleWithNoSource(f.x2, f.y2);
                        consoleWithNoSource(f.x1, f.y2);


                        let dxx = (f.x1<f.x2) ? 1 : -1;
                        let dyy = (f.y1<f.y2) ? 1 : -1;


                        let p1 = fixHolePoint(f.x1, f.y1,dxx,dyy);
                        let p2 = fixHolePoint(f.x2, f.y1,-dxx,dyy);
                        let p3 = fixHolePoint(f.x2, f.y2,-dxx,-dyy);
                        let p4 = fixHolePoint(f.x1, f.y2,dxx,-dyy);
                        let hole = [

                            new poly2tri.Point(p1.x,p1.y),
                            new poly2tri.Point(p2.x,p2.y),
                            new poly2tri.Point(p3.x,p3.y),
                            new poly2tri.Point(p4.x,p4.y),
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




                        t.getPoints().forEach(function (p) {
                            xx += p.x;
                            yy += p.y;
                        });
                        xx /= 3;
                        yy /= 3;


                        if (!full)
                            DrawJS.DebugTriangle(f.x,f.y,t.getPoints());




                        t.canPass = true;

                        console.log(t);
                        let ePoints = [
                            [t.points_[0],t.points_[1],MyMath.pointDistance(t.points_[0],t.points_[1])],
                            [t.points_[1],t.points_[2],MyMath.pointDistance(t.points_[1],t.points_[2])],
                            [t.points_[2],t.points_[0],MyMath.pointDistance(t.points_[2],t.points_[0])]
                        ]
                        let ePointsUsed = [false,false,false];
                        t.neighbors_.forEach(function (ot){
                            if (ot !== null && ot.interior_) {
                                ot.points_.forEach(function (p) {
                                    for (let i=0;i<3;i++)
                                        if (p===ePoints[i][0])
                                            for (let j=0;j<3;j++)
                                                if (p!==ot.points_[j] && ot.points_[j]===ePoints[i][1])
                                                    ePointsUsed[i] = true;
                                });
                            }



                            //if (ot!==null || ot.interior_)
                            //{
                            //
                            //}

                        });

                        let pp = 1/2*(ePoints[0][2]+ePoints[1][2]+ePoints[2][2]);
                        let ha = 2*Math.sqrt(pp*(pp-ePoints[0][2])*(pp-ePoints[1][2])*(pp-ePoints[2][2]));

                        for (let i=0;i<3;i++)
                            if (!ePointsUsed[i])
                            {
                                let height = ha/ePoints[i][2];
                                if (height<0.3)
                                {
                                    t.canPass = false;
                                    if (!full)
                                        DrawJS.DebugRedLine(f.x,f.y,ePoints[i]);
                                }

                            }







                        if (t.canPass)
                        {
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
                        }


                    }.bind(this));



                    triangles.forEach(function(t) {

                        t.neighbors_.forEach(function (ot) {

                            if (ot!==null && ot.interior_)
                            {

                                // console.log(ot);

                                if (t.canPass && ot.canPass && t.node.id<ot.node.id)
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
                                weight:s.height+s.staircaseDown.height
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
                                weight:s.height+s.staircaseUp.height
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
                                weight:1
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
                                weight:1
                            })

                            scheme.graph.edges.push(e)
                            e.SetLinks();
                        }
                    })
                })











            })


            if (full)
                this.FixGraph();
            DrawJS.UpdateCanvas();
        }
        catch (e) {
            InterfaceJS.ShowErrorMessage("Ошибка при создании графа в комнате:\n"+lastRoom.id+" "+lastRoom.name+"\n\n" +
                "К ошибке могли привети следующие условия:\n" +
                "1.Стены пересекают друг друга;\n" +
                "2.Мебель пересекается друг с другом;\n" +
                "3.Мебель пересекается со стенами;\n" +
                "4.Мебель вне стен.");

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
                    let isInit = false;
                    if (n.objType === "in_room") {
                        if (n.obj.id === r.id)
                            add = true;

                    } else if (n.objType === "door") {
                        if (n.obj.room1 === r || n.obj.room2 === r) {
                            add = true;
                            isInit = true;
                            initNodes.push(n);
                        }
                    } else {
                        if (n.obj.room.id === r.id) {
                            add = true;
                            isInit = true;
                            initNodes.push(n);
                        }
                    }
                    if (add) {

                        console.log(n);

                        roomNodes.push(n);
                        idToNode[n.id.toString()] = n;
                        roomGraph[n.id.toString()] = {};
                        usedId[n.id.toString()] = isInit;
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
                        //console.log(initNodes[i].id.toString(), initNodes[j].id.toString());
                        //console.log(res);
                        if (res)
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





