
function pointToWindow(p) {
    return new Point(project.view.viewSize.width/2+mainScale*(mainOffset.x + p.x),project.view.viewSize.height/2+mainScale*(-mainOffset.y - p.y))
}

function windowToScene(p) {
    var nx = (p.x-project.view.viewSize.width/2)/mainScale-mainOffset.x;
    var ny = -(p.y-project.view.viewSize.height/2)/mainScale-mainOffset.y;
    return new Point(nx,ny)
}

MyTool = function () {
    
    


    this.icon = {
        "movecanvas":new Raster('movecanvas').scale(2),
        "movepoint":new Raster('movepoint').scale(2),
        "moveobject":new Raster('moveobject').scale(2),
        "select":new Raster('select').scale(2)
    }

    this.helpText = new PointText({
        point: new Point(0,0),
        content: "help",
        fontSize: 24,
        justification: 'right'
    });

    this.helpText.visible = false;

    this.iconType = "movecanvas";

    this.targetType = "scene";


    this.searching = false;

    this.onMouseMove = function (mouseLayer) {



        this.mouseWindowPosition = mouseLayer;
        this.findItem();
        this.update();
    }
    


    this.onMouseDown = function (mouseLayer) {


        if (this.searching)
        {
            if (this.targetType==="select")
            {


                this.inputResult.push(this.targetElement.obj);

                console.log(this.inputResult);
                this.inputI+=1;

                if (this.inputI>=this.inputTypes.length)
                {
                    this.searching = false;

                    mainCreate(this.inputResult);

                    updateAll();

                }
                this.findItem();
                this.update();
            }
        }
        else
        {
            this.findItem()



            if (this.targetType === "movecanvas")
            {
                showParams("scheme",scheme);
            }
            else
            {
                showParams(this.targetElement.mainType,this.targetElement.obj);
            }

        }
    }


    this.askInput = function(types,helpIntro,helpTypes)
    {
        this.inputTypes = types;
        this.inputI = 0;
        this.helpIntro = helpIntro;
        this.helpTypes = helpTypes;

        this.inputResult = [];


        if (helpTypes.length===0)
        {
            this.searching = false;

            mainCreate(null);

            updateAll();
        }
        else
            this.searching = true;
    }


    this.findItem = function () {


        this.scenePosition = windowToScene(this.mouseWindowPosition);



        this.targetType = "movecanvas";

        var points = []
        elements.forEach(function (e) {
            if (e.getToolData)
            {
                var dataArray = e.getToolData();

                dataArray.forEach(function (d) {
                    var dist = Math.sqrt(Math.pow(d.x-this.scenePosition.x,2)+Math.pow(d.y-this.scenePosition.y,2))

                    if (!this.searching || (this.searching && d.search===this.inputTypes[this.inputI]))
                        if (dist<1)
                            points.push({element:e,distance:dist,data:d});
                }.bind(this))

            }
        }.bind(this))

        points = points.sort(function(a, b) {
            var x = a.distance; var y = b.distance;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });


        if (points.length>0)
        {
            this.targetElement = points[0].element;
            this.targetData = points[0].data;
            if (this.searching)
                this.targetType = "select";
            else
                this.targetType = points[0].data.type;
        }
        if (this.targetType==="movecanvas")
            this.targetPosition = this.mouseWindowPosition;
        else
            this.targetPosition = pointToWindow(new Point(this.targetData.x,this.targetData.y));


    }


    this.totalDp = new Point(0,0);


    this.onMouseDrag = function (mouseLayer,delta) {

        this.mouseWindowPosition = mouseLayer;


        var dp = new Point(delta.x/mainScale,-delta.y/mainScale);


        if (this.targetType==="movecanvas")
        {
            mainOffset+=dp;
        }
        else
        {

            if (event.altKey)
            {
                this.targetElement.onMove(this.targetData.index,dp);

            }

            else
            {
                this.totalDp+=dp;

                var kka = 0.1;

                if (Math.abs(this.totalDp.x)>=kka || (Math.abs(this.totalDp.y)>=kka))
                {
                    this.targetElement.onMove(this.targetData.index,new Point(Math.round(this.totalDp.x*10)/10,Math.round(this.totalDp.y*10)/10));
                    this.totalDp.x = 0;
                    this.totalDp.y = 0;
                }
            }

        }

        this.targetPosition+=delta;
        this.update();
    }


    this.onScroll = function () {

        this.findItem();
        this.update();
    }
    this.update = function () {

        this.iconType = this.targetType;



        for (var i in this.icon)
        {
            this.icon[i].visible = i===this.iconType;

        }

        if (this.searching)
        {
            this.helpText.content = this.helpIntro+this.helpTypes[this.inputI];
            this.helpText.visible = true;
            this.helpText.position = this.targetPosition+new Point(0,50);
        }
        else
        {
            this.helpText.visible = false;
        }


        this.icon[this.iconType].position = this.targetPosition;



    }
}



myTool = null;


function setVisibleLayer(layer,isText,visible)
{
    typeLayers[layer].forEach(function (o) {
        o.setVisible(isText,visible);
    })
}




PointElement = function (obj,mainType,layerType,x,y,color,textColor,type,updatePosition,getToolData) {

    this.obj = obj;
    this.mainType=  mainType;
    this.layerType = layerType;

    console.log(this.layerType);
    console.log(typeLayers);

    typeLayers[this.layerType].push( this);

    this.textColor = textColor;
    this.setVisible = function (isText,visible) {
        if (!isText)
            this.drawElement.visible = visible;
        if (isText && this.textColor!=null)
            this.drawText.visible = visible;
        if (!isText)
            this.visible = visible;
    }
    this.visible = true;

    this.x =x;
    this.y =y;


    this.onMove = function (index,delta) {
        this.obj.move(index,delta.x,delta.y);
    }


    if (type==="rect")
        this.drawElement = new Path.RegularPolygon(new Point(0,0),4,10);
    else if (type==="circle")
        this.drawElement = new Path.Circle({
            center: [0,0],
            radius: 6
        });
    this.drawElement.strokeColor = color;
    this.drawElement.fillColor = color;

    if (this.textColor!=null)
        this.drawText = new PointText({
            point: new Point(0,0),
            content: '',
            fontSize: 10,
            justification: 'left',
            fillColor : textColor
        });

    this.updatePath = function () {
        var p = pointToWindow(new Point(this.x,this.y));
        this.drawElement.position.x = p.x;
        this.drawElement.position.y = p.y;


        if (this.textColor!=null)
            this.drawText.position = new Point(p.x,p.y)+new Point(10,14);





    }

    this.getToolData = getToolData;


    /*
    this.drawElement.onMouseDown = function (event) {

        //this.drawElement.selected = true;

    }.bind(this)


    this.drawElement.onMouseDrag = function (event) {


        this.obj.move(
            event.delta.x/mainScale,
            -event.delta.y/mainScale);


        updateAll();


    }.bind(this);
*/

    this.updatePosition = updatePosition;

    this.updatePath();



    updateAll();
}





LineElement = function (obj,mainType,layerType,x1,y1,x2,y2,color,textColor,width,updatePosition,getToolData) {

    this.obj = obj;
    this.mainType=  mainType;
    this.layerType = layerType;


    if (this.layerType in typeLayers)
         typeLayers[this.layerType].push( this);

    this.textColor = textColor;
    this.setVisible = function (isText,visible) {
        if (!isText)
            this.drawElement.visible = visible;
        if (isText && this.textColor!=null)
            this.drawText.visible = visible;
        if (!isText)
            this.visible = visible;
    }
    this.visible = true;


    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;


    this.onMove = function (index,delta) {
        this.obj.move(index,delta.x,delta.y);
    }


    this.drawElement = new Path.Line(new Point(0,0),new Point(1,1));
    this.drawElement.strokeColor = color;

    this.drawElement.strokeWidth = width;




    if (this.textColor!=null)
        this.drawText = new PointText({
            point: new Point(0,0),
            content: '',
            fontSize: 12,
            justification: 'left',
            fillColor : this.textColor
        });



    this.updatePath = function () {
        var p1 = pointToWindow(new Point(this.x1,this.y1));

        this.drawElement.segments[0].point.x = p1.x;
        this.drawElement.segments[0].point.y = p1.y;


        var p2 = pointToWindow(new Point(this.x2,this.y2));

        this.drawElement.segments[1].point.x = p2.x;
        this.drawElement.segments[1].point.y = p2.y;


        if (this.textColor!=null)
            this.drawText.position = new Point((p1.x+p2.x)/2,(p1.y+p2.y)/2)+new Point(14,14);

    }

    this.getToolData = getToolData;

    this.updatePosition = updatePosition;



    updateAll();
}

RectElement = function(obj,mainType,layerType,x1,y1,x2,y2,color,textColor,updatePosition,getToolData) {

    this.obj = obj;
    this.mainType=  mainType;
    this.layerType = layerType;

    typeLayers[this.layerType].push( this);

    this.textColor = textColor;
    this.setVisible = function (isText,visible) {
        if (!isText)
            this.drawElement.visible = visible;
        if (isText && this.textColor!=null)
            this.drawText.visible = visible;
        if (!isText)
            this.visible = visible;
    }
    this.visible = true;

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;


    if (this.textColor!=null)
        this.drawText = new PointText({
            point: new Point(0,0),
            content: '',
            fontSize: 12,
            justification: 'left',
            fillColor : this.textColor
        });



    this.onMove = function (index,delta) {
        this.obj.move(index,delta.x,delta.y);
    }


    this.drawElement = new Path.Rectangle(new Point(x1,y1), new Point(x2,y2))
    this.drawElement.strokeColor = color;





/*
    this.pathData = [];
    this.drawElement.segments.forEach(function (s) {
        this.pathData.push([s.point.x,s.point.y]);
    }.bind(this));
*/
    //console.log(this.pathData);

    this.updatePath = function () {


        this.pathData = [[
            this.obj.room.floor.x+this.obj.x1,
            this.obj.room.floor.y+this.obj.y1],
            [
            this.obj.room.floor.x+this.obj.x2,
            this.obj.room.floor.y+this.obj.y1],
            [
            this.obj.room.floor.x+this.obj.x2,
            this.obj.room.floor.y+this.obj.y2],

            [this.obj.room.floor.x+this.obj.x1,
            this.obj.room.floor.y+this.obj.y2]];


        for (var i=0;i<this.pathData.length;i++)
        {
            var p = this.pathData[i];
            var np = pointToWindow(new Point(p[0],p[1]));


            this.drawElement.segments[i].point.x = np.x;
            this.drawElement.segments[i].point.y = np.y;

        }


    }

    this.getToolData = getToolData;
    this.updatePosition = updatePosition;

    updateAll();


}

PortalElement = function(obj,mainType,layerType,color,textColor,type,updatePosition,getToolData) {

    this.obj = obj;
    this.mainType=  mainType;
    this.layerType = layerType;

    typeLayers[this.layerType].push( this);

    this.textColor = textColor;
    this.setVisible = function (isText,visible) {
        if (!isText)
            this.drawElement.visible = visible;
        if (isText && this.textColor!=null)
            this.drawText.visible = visible;
        if (!isText)
            this.visible = visible;
    }
    this.visible = true;

    if (this.textColor!=null)
        this.drawText = new PointText({
            point: new Point(0,0),
            content: '',
            fontSize: 14,
            justification: 'left',
            fillColor : textColor
        });


    this.onMove = function (index,delta) {
        this.obj.move(index,delta.x,delta.y);
    }





    this.x = 0;
    this.y = 0;







    if (type==="staircase")
    {
        this.coords = [[0,this.obj.width/2],[this.obj.height,this.obj.width/2],[this.obj.height,-this.obj.width/2],[0,-this.obj.width/2]]
        this.coords.push(this.coords[0])

        for (i=0;i<5;i+=1)
        {
            this.coords.push([i/5*this.obj.height,-this.obj.width/2])
            this.coords.push([i/5*this.obj.height,this.obj.width/2])
            this.coords.push([(i+0.5)/5*this.obj.height,this.obj.width/2])
            this.coords.push([(i+0.5)/5*this.obj.height,-this.obj.width/2])
        }

    }
    else
    {
        this.coords = [[0,0.5],[1,0.5],[1,-0.5],[0,-0.5]]

        this.coords.push(this.coords[0])
        this.coords.push(this.coords[2])
        this.coords.push(this.coords[1])
        this.coords.push(this.coords[3])
    }



    this.drawElement = new Path();

    this.drawElement.strokeColor = color;

    for (i=0;i<this.coords.length-1;i+=1)
    {
        this.drawElement.moveTo(new Point(0,0))
        this.drawElement.lineTo(new Point(0,0))
    }


    /*
        this.pathData = [];
        this.drawElement.segments.forEach(function (s) {
            this.pathData.push([s.point.x,s.point.y]);
        }.bind(this));
    */
    //console.log(this.pathData);

    this.updatePath = function () {




        for (i=0;i<this.coords.length;i+=1)
        {
            var aa = this.direction/180*Math.PI
            var dx = this.coords[i][0]*Math.cos(aa)-this.coords[i][1]*Math.sin(aa);
            var dy = this.coords[i][0]*Math.sin(aa)+this.coords[i][1]*Math.cos(aa);


            np = pointToWindow(new Point(this.x+dx,this.y+dy));


            this.drawElement.segments[i].point.x = np.x;
            this.drawElement.segments[i].point.y = np.y;
        }


        if (this.textColor!=null)
            this.drawText.position = new Point(np.x,np.y)+new Point(10,14);



    }

    this.getToolData = getToolData;
    this.updatePosition = updatePosition;

    updateAll();


}



function addElevatorElement(elevator)
{

    e = new PortalElement(elevator,"elevator","elevator",
        "#3f8b92",
        "#3f8b92",
        "elevator",
        function () {
            this.x = this.obj.room.floor.x+this.obj.x;
            this.y = this.obj.room.floor.y+this.obj.y;
            this.direction = this.obj.direction;


            this.drawText.content = this.obj.id;
        },null
    )
    elements.push(e);
    return e;
}

function addStaircaseElement(staircase)
{


    e = new PortalElement(staircase,"staircase","staircase",
        "#9c4e0f",
        "#9c4e0f",
        "staircase",
        function () {
            this.x = this.obj.room.floor.x+this.obj.x;
            this.y = this.obj.room.floor.y+this.obj.y;
            this.direction = this.obj.direction;


            this.drawText.content = this.obj.id;

        },null
    )

    elements.push(e);
    return e;
}


function addFloorElement(floor) {
    e = new PointElement(floor,"floor","floor",
        floor.x,
        floor.y,
        "#c10037",
        "#c10037",
        "rect",
        function () {
            this.x = this.obj.x;
            this.y = this.obj.y;

            this.drawText.content = this.obj.id+' '+this.obj.name;

        },function () {
            return [{type:"moveobject",search:"floor",index:0,x:this.x,y:this.y}]
        }
    )
    elements.push(e);
    return e;
}

function addRoomElement(room) {

    e = new PointElement(room,"room","room",
        room.floor.x+room.x,
        room.floor.y+room.y,
        "#02c100",
        "#02c100",
        "rect",
        function () {
            this.x = this.obj.floor.x+this.obj.x;
            this.y = this.obj.floor.y+this.obj.y;


            this.drawText.content = this.obj.id+' '+this.obj.name;


        },function () {
            return [{type:"moveobject",search:"room",index:0,x:this.x,y:this.y}]
        }
    )
    elements.push(e);
    return e;
};

function addWallElement(wall) {



    e = new LineElement(wall,"wall","room",
        wall.room.floor.x+wall.x1,
        wall.room.floor.y+wall.y1,
        wall.room.floor.x+wall.x2,
        wall.room.floor.y+wall.y2,
        '#074444',
        null,
        2,
        function () {
            this.x1 = this.obj.room.floor.x+this.obj.x1;
            this.y1 = this.obj.room.floor.y+this.obj.y1;
            this.x2 = this.obj.room.floor.x+this.obj.x2;
            this.y2 = this.obj.room.floor.y+this.obj.y2;


        },function () {
            return [
                {type:"moveobject",index:0,search:"wall",x:(this.x1+this.x2)/2,y:(this.y1+this.y2)/2},
                {type:"movepoint",index:1,search:null,x:this.x1,y:this.y1},
                {type:"movepoint",index:2,search:null,x:this.x2,y:this.y2}]
        })

    elements.push(e);
    return e;
}

function addFurnitureElement(furniture) {


    e = new RectElement(furniture,"furniture","furniture",
        furniture.room.floor.x+furniture.x1,
        furniture.room.floor.y+furniture.y1,
        furniture.room.floor.x+furniture.x2,
        furniture.room.floor.y+furniture.y2,
        '#939191',
        '#939191',
        function () {
            this.x1 = this.obj.room.floor.x+this.obj.x1;
            this.y1 = this.obj.room.floor.y+this.obj.y1;
            this.x2 = this.obj.room.floor.x+this.obj.x2;
            this.y2 = this.obj.room.floor.y+this.obj.y2;

            this.drawText.content = this.obj.name;
        },function () {
            return [
                {type:"moveobject",index:0,search:"furniture",x:(this.x1+this.x2)/2,y:(this.y1+this.y2)/2},
                {type:"movepoint",index:1,search:null,x:this.x1,y:this.y1},
                {type:"movepoint",index:2,search:null,x:this.x2,y:this.y2}]
        })

    elements.push(e);
    return e;

}


function addNodeElement(node) {



    e = new PointElement(node,"node","node",
        node.floor.x+node.x,
        node.floor.y+node.y,
        "#a400c1",
        "#a400c1",
        "circle",
        function () {
            this.x = this.obj.floor.x+this.obj.x;
            this.y = this.obj.floor.y+this.obj.y;

            this.drawText.content = this.obj.id;
        },null
    )
    elements.push(e);
    return e;
}

function addDoorElement(door) {

    e = new LineElement(door,"door","door",
        door.floor.x+door.x1,
        door.floor.y+door.y1,
        door.floor.x+door.x2,
        door.floor.y+door.y2,
        '#c16149',
        '#c16149',
        30,
        function () {
            this.x1 = this.obj.floor.x+this.obj.x1;
            this.y1 = this.obj.floor.y+this.obj.y1;
            this.x2 = this.obj.floor.x+this.obj.x2;
            this.y2 = this.obj.floor.y+this.obj.y2;

            this.drawText.content = this.obj.id+' {'+(this.obj.room1 ? this.obj.room1.id:'_') +','+this.obj.room2.id+'}';
        },function () {
            return [
                {type:"moveobject",index:0,search:"door",x:(this.x1+this.x2)/2,y:(this.y1+this.y2)/2},
                {type:"movepoint",index:1,search:null,x:this.x1,y:this.y1},
                {type:"movepoint",index:2,search:null,x:this.x2,y:this.y2}]
        })

    elements.push(e);
    return e;
}

function addEdgeElement(edge) {


    e = new LineElement(edge,"edge","edge",
        edge.node1.floor.x+edge.node1.x,
        edge.node1.floor.y+edge.node1.y,
        edge.node2.floor.x+edge.node2.x,
        edge.node2.floor.y+edge.node2.y,
        '#bd68cd',
        '#bd68cd',
        1,
        function () {
            this.x1 = this.obj.node1.floor.x+this.obj.node1.x;
            this.y1 = this.obj.node1.floor.y+this.obj.node1.y;
            this.x2 = this.obj.node2.floor.x+this.obj.node2.x;
            this.y2 = this.obj.node2.floor.y+this.obj.node2.y;

            this.drawText.content = this.obj.weight.toFixed(1);
        },
        null)

    elements.push(e);
    return e;
}

function addQRElement(qr) {
    e = new PointElement(qr,"qr","qr",
        qr.room.floor.x+qr.x,
        qr.room.floor.y+qr.y,
        "#3efffa",
        "#3765c2",
        "rect",
        function () {
            this.x = this.obj.room.floor.x+this.obj.x;
            this.y = this.obj.room.floor.y+this.obj.y;

            this.drawText.content = this.obj.id+' ('+this.obj.direction+'*)'
        },
        function () {
            return [{type:"moveobject",search:"qr",index:0,x:this.x,y:this.y}]
        }
    )
    elements.push(e);
    return e;
}

function destroyElement(obj) {
    var eI = -1;
    var e = null;

    for (var i=0;i<elements.length;i++)
    {
        if (elements[i].obj === obj)
        {
            e = elements[i];
            eI = i;
        }

    }

    elements.splice(i,1);
    e.drawElement.remove();
    if (typeof  e.drawElement != "undefined")
        e.drawText.remove();
}

function mainOnLoad() {
    //myTool = new MyTool();
}

function init()
{



    project.activeLayer.removeChildren();


    typeLayers = {}
    types = ["room","door","elevator","wall","staircase","qr","node","edge","furniture","floor"]

    types.forEach(function (t) {
        typeLayers[t] = []
        //typeLayers[t+"Data"] = []
    })



    myTool = new MyTool();

    elements = [];
    mainOffset = new Point(0,0);
    mainScale = 60;






    for (var l=-50;l<50;l++)
    {

        elements.push(new LineElement(null,"grid","grid",l,-5000,l,5000,'#d8effa',null,1,null,null))

        elements.push(new LineElement(null,"grid","grid",-5000,l,5000,l,'#d8effa',null,1,null,null))


    }




    updateAll();
}



function updateAll()
{
    elements.forEach(function (e) {
        if (e.updatePosition)
            e.updatePosition();
        e.updatePath();

    })
}


function onMouseDown(event) {

    if (myTool)
        myTool.onMouseDown(new Point(event.event.layerX,event.event.layerY));

}
/*


function onMouseDrag(event) {


    if (event.event.buttons ===4 )
    {


        curr = new Point(event.event.x/mainScale,-event.event.y/mainScale);
        mainOffset = mainStartOffset+curr-mouseStartOffset;


        updateAll();
    }
}
*/
function onMouseDrag(event) {
    if (myTool)
        myTool.onMouseDrag(new Point(event.event.layerX,event.event.layerY),new Point(event.delta.x,event.delta.y));


    updateAll();
}

function onMouseMove(event) {

    if (myTool)
        myTool.onMouseMove(new Point(event.event.layerX,event.event.layerY));


    //updateAll();
}

function onScroll(event)
{


    mainScale-=event.deltaY/20;



    if (mainScale<10)
        mainScale = 10;
    if (mainScale>100)
        mainScale = 100;


    if (myTool)
        myTool.onScroll();

    updateAll();
}

function askInput(types,helpIntro,helpTypes)
{


    if (myTool)
    {
        myTool.askInput(types,helpIntro,helpTypes);
    }

    //if (types[0]==="floor")
    //    mainCreate([scheme.floors[0]])

}



trDebug = [];
function debugTriangle(points)
{
    var drawElement = new Path();
    drawElement.strokeColor = '#c7dee0';

    for (var i=0;i<points.length-1;i+=1)
    {
        drawElement.moveTo(pointToWindow(new Point(points[i].x,points[i].y)))
        drawElement.lineTo(pointToWindow(new Point(points[i+1].x,points[i+1].y)))
    }

    trDebug.push(drawElement);
}

function removeDebugTriangles()
{
    trDebug.forEach(function (t) {
        t.remove();
    });

    trDebug = [];
}



drawJS.debugTriangle = debugTriangle;
drawJS.removeDebugTriangles = removeDebugTriangles;


drawJS.init = init;
drawJS.setVisibleLayer = setVisibleLayer;

drawJS.onScroll = onScroll;

drawJS.addFloorElement = addFloorElement;
drawJS.addRoomElement = addRoomElement;
drawJS.addWallElement = addWallElement;
drawJS.addFurnitureElement = addFurnitureElement;

drawJS.addEdgeElement = addEdgeElement;
drawJS.addNodeElement = addNodeElement;

drawJS.addDoorElement = addDoorElement;
drawJS.addQRElement = addQRElement;

drawJS.addElevatorElement = addElevatorElement;
drawJS.addStaircaseElement = addStaircaseElement;

drawJS.askInput = askInput;

drawJS.mainOnLoad = mainOnLoad;

drawJS.destroyElement = destroyElement;