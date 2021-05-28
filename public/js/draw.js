
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

    /*this.helpText = new PointText({
        point: new Point(0,0),
        content: "help",
        fontSize: 24,
        justification: 'right'
    });*/

    //this.helpText.visible = false;

    this.iconType = "movecanvas";

    this.targetType = "scene";


    this.searching = false;

    this.onMouseMove = function (mouseLayer) {



        this.mouseWindowPosition = mouseLayer;
        this.findItem();
        this.update();
    }
    


    this.onMouseDown = function (mouseLayer,mouseRight) {


        if (this.searching)
        {
            var itemAdded = false;

            if (mouseRight)
            {
                this.inputResult.push(null);
                itemAdded = true;
            } else if (this.targetType==="select")
            {


                this.inputResult.push(this.targetElement.obj);
                itemAdded = true;


            }

            if (itemAdded)
            {
                this.inputI+=1;

                if (this.inputI>=this.inputTypes.length)
                {
                    this.searching = false;

                    EditorJS.MainCreate(this.inputResult);

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
                EditorJS.ShowParams("scheme");
            }
            else
            {
                EditorJS.ShowParams(this.targetElement.mainType,this.targetElement.obj);
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

            EditorJS.MainCreate(null);

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
            if (e.getToolData && e.visible) {
                var dataArray = e.getToolData();

                dataArray.forEach(function (d) {
                    var dist = Math.sqrt(Math.pow(d.x - this.scenePosition.x, 2) + Math.pow(d.y - this.scenePosition.y, 2))

                    if (!this.searching || (this.searching && d.search === this.inputTypes[this.inputI]))
                        if (dist < 1)
                            points.push({element: e, distance: dist, data: d});
                }.bind(this))

            }
        }.bind(this))

        points = points.sort(function (a, b) {
            var x = a.distance;
            var y = b.distance;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });


        var prevTarget = this.targetElement;
        if (points.length > 0) {
            this.targetElement = points[0].element;
            this.targetData = points[0].data;
            if (this.searching)
                this.targetType = "select";
            else
                this.targetType = points[0].data.type;
        }
        if (this.targetType === "movecanvas")
            this.targetPosition = this.mouseWindowPosition;
        else
            this.targetPosition = pointToWindow(new Point(this.targetData.x, this.targetData.y));

        if (typeof prevTarget !== "undefined")
        {
            if (prevTarget!==this.targetElement)
                if (typeof  prevTarget.setVisibleMarkup !== "undefined" )
                {
                    prevTarget.setVisibleMarkup(false);
                    this.targetElement.setVisibleMarkup(true);
                }
        }



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
                this.targetElement.onMove(this.targetData.index,dp,true);

            }

            else
            {
                this.totalDp+=dp;

                var kka = 0.1;

                if (Math.abs(this.totalDp.x)>=kka || (Math.abs(this.totalDp.y)>=kka))
                {
                    this.targetElement.onMove(this.targetData.index,new Point(Math.round(this.totalDp.x*10)/10,Math.round(this.totalDp.y*10)/10),false);
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

            EditorJS.SetHint(this.helpIntro+this.helpTypes[this.inputI]);

            /*this.helpText.content = ;
            this.helpText.visible = true;
            this.helpText.position = this.targetPosition+new Point(0,50);*/
        }
        else
        {
            EditorJS.SetHint("");
            //this.helpText.visible = false;
        }


        this.icon[this.iconType].position = this.targetPosition;



    }
}



myTool = null;

layerVisible = {'grid':true,'floor':true,'floor_text':true};

function setVisibleLayer(layer,isText,visible)
{

    layerVisible[layer+(isText ?'_text':'')] = visible;

    //console.log(layerVisible);

    typeLayers[layer].forEach(function (o) {
        if (isText)
        {
            o.setVisible(true,visible && layerVisible[layer]);
        }
        else
        {
            if (visible)
            {
                o.setVisible(false,true);
                o.setVisible(true,layerVisible[layer+'_text'])
            }
            else
            {
                o.setVisible(false,false);
                o.setVisible(true,false)
            }

        }



    });




}




markupMain = function(t)
{
    t.initMarkup = function () {
        this.drawMarkup = [];
        this.markupCoords = [];
        for (var i=0;i<this.markupNumber;i++)
        {
            this.drawMarkup.push(new PointText({
                point: new Point(0,0),
                content: '.',
                fontSize: 10,
                justification: 'left',
                fillColor : '#000000',
                style : {fontWeight:'bold'}
            }));

            this.markupCoords.push([0,0]);
        }
    }
    t.updateMarkup = function () {
        for (var i=0;i<this.markupNumber;i++)
        {
            this.drawMarkup[i].position =  pointToWindow(new Point(this.markupCoords[i][0], this.markupCoords[i][1]))+new Point(15,-15);
        }
    }
    t.setVisibleMarkup = function (visible) {
        for (var i=0;i<this.markupNumber;i++)
        {
            this.drawMarkup[i].visible = visible;
        }
    }
}

PointElement = function (obj,mainType,layerType,color,textColor,type,updatePosition,getToolData,markupNumber) {

    this.obj = obj;
    this.mainType=  mainType;
    this.layerType = layerType;

    //console.log(this.layerType);
   // console.log(typeLayers);

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





    this.x =0;
    this.y =0;

    this.direction = 0;

    this.onMove = function (index,delta,free) {
        this.obj.move(index,delta.x,delta.y,free);
    }


    if (type==="rect")
        this.drawElement = new Path.RegularPolygon(new Point(0,0),4,10);
    else if (type==="circle")
        this.drawElement = new Path.Circle({
            center: [0,0],
            radius: 2
        });
    else if (type==="triangle")
        this.drawElement = new Path.RegularPolygon(new Point(0,0),3,10);


    this.type = type;

    this.drawElement.strokeColor = color;
    this.drawElement.strokeWidth = 2;
    this.drawElement.fillColor = color;





    if (this.textColor!=null)
    {
        this.drawText = new PointText({
            point: new Point(0,0),
            content: '',
            fontSize: 11,
            justification: 'left',
            fillColor : textColor

        });

        if (type==="triangle")
            this.drawText.style = {fontWeight: 'bold'}

    }


    markupMain(this);
    this.markupNumber = markupNumber;
    this.initMarkup();
    this.setVisibleMarkup(false);



    this.updatePath = function () {
        var p = pointToWindow(new Point(this.x,this.y));
        this.drawElement.position.x = p.x;
        this.drawElement.position.y = p.y;


        if (this.textColor!=null)
            this.drawText.position = new Point(p.x,p.y)+new Point(10,14);



        if (this.type==="triangle")
        {

            var aa = this.direction/180*Math.PI;
            var pathData = [[
                this.x,
                this.y],
                [
                    this.x-0.2*Math.cos(aa-0.5),
                    this.y-0.2*Math.sin(aa-0.5)],
                [
                    this.x-0.2*Math.cos(aa+0.5),
                    this.y-0.2*Math.sin(aa+0.5)]];


            for (var i=0;i<pathData.length;i++)
            {
                var p = pathData[i];
                var np = pointToWindow(new Point(p[0],p[1]));

                this.drawElement.segments[i].point.x = np.x;
                this.drawElement.segments[i].point.y = np.y;

            }
        }


        this.updateMarkup();


    }

    this.getToolData = getToolData;



    this.updatePosition = updatePosition;

    this.updatePath();

    //console.log(mainType,layerType,layerVisible[layerType]);
    this.setVisible(false,layerVisible[layerType]);
    this.setVisible(true,layerVisible[layerType+'_text']);


    //updateAll();
}




LineElement = function (obj,mainType,layerType,color,textColor,width,updatePosition,getToolData,markupNumber) {

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



    markupMain(this);
    this.markupNumber = markupNumber;
    this.initMarkup();
    this.setVisibleMarkup(false);


    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 1;
    this.y2 = 1;

    this.setCoords = function (x1,y1,x2,y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }


    this.onMove = function (index,delta,free) {
        this.obj.move(index,delta.x,delta.y,free);
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

        this.updateMarkup();

    }

    this.getToolData = getToolData;

    this.updatePosition = updatePosition;

    this.setVisible(false,layerVisible[layerType]);
    this.setVisible(true,layerVisible[layerType+'_text']);

    //updateAll();
}


DoorElement = function (obj,mainType,layerType,color,textColor,updatePosition,getToolData,markupNumber) {

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


    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 1;
    this.y2 = 1;
    this.direction1 = 0;
    this.direction2 = 0;
    this.width = 1;

    this.onMove = function (index,delta,free,free) {
        this.obj.move(index,delta.x,delta.y,free,free);
    }


    this.drawElement = new Path([new Point(0,0),new Point(0,1),new Point(1,1),new Point(1,0),new Point(0,0)]);
    //this.drawElement.strokeColor = color;

    //this.drawElement.strokeWidth = 1;
    this.drawElement.fillColor = color;
    this.drawElement.opacity = 0.7;



    if (this.textColor!=null)
        this.drawText = new PointText({
            point: new Point(0,0),
            content: '',
            fontSize: 12,
            justification: 'left',
            fillColor : this.textColor
        });


    markupMain(this);
    this.markupNumber = markupNumber;
    this.initMarkup();
    this.setVisibleMarkup(false);


    this.updatePath = function () {



        var points = [
            [this.x1 +Math.cos((this.direction1-90)/180*Math.PI)*this.width/2,
                this.y1 +Math.sin((this.direction1-90)/180*Math.PI)*this.width/2],
            [this.x1 +Math.cos((this.direction1+90)/180*Math.PI)*this.width/2,
                this.y1 +Math.sin((this.direction1+90)/180*Math.PI)*this.width/2],

            [this.x2 +Math.cos((this.direction2-90)/180*Math.PI)*this.width/2,
                this.y2 +Math.sin((this.direction2-90)/180*Math.PI)*this.width/2],
            [this.x2 +Math.cos((this.direction2+90)/180*Math.PI)*this.width/2,
                this.y2 +Math.sin((this.direction2+90)/180*Math.PI)*this.width/2],

        ]
        points.push(points[0])


        var newPoints = []

        for (var i=0;i<5;i++)
        {
            var p = pointToWindow(new Point(points[i][0],points[i][1]));
            newPoints.push(p);
            this.drawElement.segments[i].point.x = p.x;
            this.drawElement.segments[i].point.y = p.y;
        }







        if (this.textColor!=null)
            this.drawText.position = new Point((newPoints[0].x+newPoints[2].x)/2,(newPoints[0].y+newPoints[2].y+60)/2)+new Point(14,-14);


        this.updateMarkup();

    }

    this.getToolData = getToolData;

    this.updatePosition = updatePosition;

    this.setVisible(false,layerVisible[layerType]);
    this.setVisible(true,layerVisible[layerType+'_text']);

    //updateAll();

}

RectElement = function(obj,mainType,layerType,color,textColor,updatePosition,getToolData,markupNumber) {

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
            fontSize: 11,
            justification: 'center',
            fillColor : this.textColor
        });



    this.onMove = function (index,delta,free) {
        this.obj.move(index,delta.x,delta.y,free);
    }


    this.drawElement = new Path.Rectangle(new Point(0,0), new Point(1,1))
    this.drawElement.strokeColor = color;
    this.drawElement.strokeWidth = 1.5;


    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 1;
    this.y2 = 1;


/*
    this.pathData = [];
    this.drawElement.segments.forEach(function (s) {
        this.pathData.push([s.point.x,s.point.y]);
    }.bind(this));
*/
    //console.log(this.pathData);

    markupMain(this);
    this.markupNumber = markupNumber;
    this.initMarkup();
    this.setVisibleMarkup(false);

    this.updatePath = function () {


        var pathData = [[
            this.x1,
            this.y1],
            [
            this.x2,
            this.y1],
            [
            this.x2,
            this.y2],

            [this.x1,
            this.y2]];


        var cx = 0;
        var cy  =0;
        for (var i=0;i<pathData.length;i++)
        {
            var p = pathData[i];
            var np = pointToWindow(new Point(p[0],p[1]));


            this.drawElement.segments[i].point.x = np.x;
            this.drawElement.segments[i].point.y = np.y;
            cx+=np.x;
            cy+=np.y;

        }
        cx/=pathData.length;
        cy/=pathData.length;


        if (this.textColor!=null)
            this.drawText.position = new Point(cx,cy);


        this.updateMarkup();
    }

    this.getToolData = getToolData;
    this.updatePosition = updatePosition;

    this.setVisible(false,layerVisible[layerType]);
    this.setVisible(true,layerVisible[layerType+'_text']);
    //updateAll();


}

PortalElement = function(obj,mainType,layerType,color,textColor,type,updatePosition,getToolData,markupNumber) {

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
            fontSize: 12,
            justification: 'center',
            fillColor : textColor
        });


    this.onMove = function (index,delta,free) {
        this.obj.move(index,delta.x,delta.y,free);
    }






    this.x = 0;
    this.y = 0;

    this.width = 1;
    this.height = 1;







    if (type==="staircase")
    {
        this.coords = [[0,1/2],[1,1/2],[1,-1/2],[0,-1/2]]
        this.coords.push(this.coords[0])

        for (i=0;i<5;i+=1)
        {
            this.coords.push([i/5*1,-1/2])
            this.coords.push([i/5*1,1/2])
            this.coords.push([(i+0.5)/5*1,1/2])
            this.coords.push([(i+0.5)/5*1,-1/2])
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

    markupMain(this);
    this.markupNumber = markupNumber;
    this.initMarkup();
    this.setVisibleMarkup(false);


    this.updatePath = function () {




        var tx = 0;
        var ty = 0;
        for (i=0;i<this.coords.length;i+=1)
        {
            var aa = this.direction/180*Math.PI
            var dx = this.coords[i][0]*this.height*Math.cos(aa)-this.coords[i][1]*this.width*Math.sin(aa);
            var dy = this.coords[i][0]*this.height*Math.sin(aa)+this.coords[i][1]*this.width*Math.cos(aa);


            np = pointToWindow(new Point(this.x+dx,this.y+dy));


            this.drawElement.segments[i].point.x = np.x;
            this.drawElement.segments[i].point.y = np.y;

            tx+=np.x;
            ty+=np.y;
        }

        tx/=this.coords.length;
        ty/=this.coords.length;

        if (this.textColor!=null)
            this.drawText.position = new Point(tx,ty);//new Point(np.x,np.y)+new Point(20,25);



        this.updateMarkup();
    }

    this.getToolData = getToolData;
    this.updatePosition = updatePosition;



    //console.log(mainType,layerType,layerVisible[layerType]);
    this.setVisible(false,layerVisible[layerType]);
    this.setVisible(true,layerVisible[layerType+'_text']);
   // updateAll();


}



function addElevatorElement(elevator)
{

    e = new PortalElement(elevator,"elevator","elevator",
        "#3f8b92",
        "#204a4e",
        "elevator",
        function () {
            this.x = this.obj.room.floor.x+this.obj.x;
            this.y = this.obj.room.floor.y+this.obj.y;
            this.direction = this.obj.direction;



            var t = '{'+this.obj.id+'}';
            if (this.obj.elevatorDown)
                t+=' {DOWN_ID:'+this.obj.elevatorDown.id+'}';
            if (this.obj.elevatorUp)
                t+=' {UP_ID:'+this.obj.elevatorUp.id+'}';

            this.drawText.content = t;



        },function () {
            return [{type:"moveobject",
                search:"elevator",
                index:0,
                x:this.x+0.5*Math.cos(this.direction/180*Math.PI),
                y:this.y+0.5*Math.sin(this.direction/180*Math.PI)}
                ]
        },
        0
    )
    elements.push(e);
    return e;
}

function addStaircaseElement(staircase)
{


    e = new PortalElement(staircase,"staircase","staircase",
        "#9c4e0f",
        "#7b3f0f",
        "staircase",
        function () {
            this.x = this.obj.room.floor.x+this.obj.x;
            this.y = this.obj.room.floor.y+this.obj.y;
            this.direction = this.obj.direction;



            this.width = this.obj.width;
            this.height = this.obj.height;

            var t = '{'+this.obj.id+'}';
            if (this.obj.staircaseDown)
                t+=' {DOWN_ID:'+this.obj.staircaseDown.id+'}';
            if (this.obj.staircaseUp)
                t+=' {UP_ID:'+this.obj.staircaseUp.id+'}';

            this.drawText.content = t;

        },function () {
            return [{type:"moveobject",
                search:"staircase",
                index:0,
                x:this.x+0.5*Math.cos(this.direction/180*Math.PI),
                y:this.y+0.5*Math.sin(this.direction/180*Math.PI)}
            ]
        },
        0
    )

    elements.push(e);
    return e;
}


function addFloorElement(floor) {

    mainOffset.x = -floor.x;
    mainOffset.y = -floor.y;

    e = new PointElement(floor,"floor","floor",
        "#c10037",
        "#c10037",
        "rect",
        function () {
            this.x = this.obj.x;
            this.y = this.obj.y;

            this.drawText.content = this.obj.name;

        },function () {
            return [{type:"moveobject",search:"floor",index:0,x:this.x,y:this.y}]
        },
        0
    )
    elements.push(e);
    return e;
}

function addRoomElement(room) {



    e = new PointElement(room,"room","room",
        "#02c100",
        "#02c100",
        "rect",
        function () {
            this.x = this.obj.floor.x+this.obj.x;
            this.y = this.obj.floor.y+this.obj.y;


            this.drawText.content = this.obj.id+' '+this.obj.name;

            this.drawElement.fillColor.alpha = this.obj.canSearch ? 1 : 0;

            var minX = null;
            var minY = null;
            this.obj.walls.forEach(function (w) {
                if (minX===null || (w.x1<=minX && w.y1<=minY))
                {
                    minX = w.x1;
                    minY = w.y1;
                }
            })

            this.markupCoords = [
                [this.obj.floor.x+minX,this.obj.floor.y+minY]
            ]

            this.drawMarkup[0].content = '('+MyMath.round(minX,2)+','+MyMath.round(minY,2)+')';





        },function () {
            return [{type:"moveobject",search:"room",index:0,x:this.x,y:this.y}]
        },
        1
    )
    elements.push(e);
    return e;
};

function addWallElement(wall) {



    e = new LineElement(wall,"wall","room",
        '#0e7f7f',
        null,
        2,
        function () {
            this.x1 = this.obj.room.floor.x+this.obj.x1;
            this.y1 = this.obj.room.floor.y+this.obj.y1;
            this.x2 = this.obj.room.floor.x+this.obj.x2;
            this.y2 = this.obj.room.floor.y+this.obj.y2;


            this.markupCoords = [
                [this.obj.room.floor.x+(this.obj.prevWall.x1+this.obj.prevWall.x2)/2,
                    this.obj.room.floor.y+(this.obj.prevWall.y1+this.obj.prevWall.y2)/2],
                [this.x1,this.y1],
                [(this.x1+this.x2)/2,(this.y1+this.y2)/2],
                [this.x2,this.y2]
            ]

            this.drawMarkup[0].content = MyMath.round(MyMath.pointDistance(
                {x:this.obj.prevWall.x1,y:this.obj.prevWall.y1},{x:this.obj.prevWall.x2,y:this.obj.prevWall.y2}),2)+'m';
            this.drawMarkup[1].content = '('+MyMath.round(this.obj.x1,2)+','+MyMath.round(this.obj.y1,2)+')';
            this.drawMarkup[2].content = MyMath.round(MyMath.pointDistance(
                {x:this.obj.x1,y:this.obj.y1},{x:this.obj.x2,y:this.obj.y2}),2)+'m';
            this.drawMarkup[3].content = '('+MyMath.round(this.obj.x2,2)+','+MyMath.round(this.obj.y2,2)+')';


        },function () {
            return [
                {type:"moveobject",index:0,search:"wall",x:(this.x1+this.x2)/2,y:(this.y1+this.y2)/2},
                {type:"movepoint",index:1,search:null,x:this.x1,y:this.y1}]
        },
        4)



    elements.push(e);
    return e;
}

function addFurnitureElement(furniture) {


    e = new RectElement(furniture,"furniture","furniture",
        '#939191',
        '#939191',
        function () {
            this.x1 = this.obj.room.floor.x+this.obj.x1;
            this.y1 = this.obj.room.floor.y+this.obj.y1;
            this.x2 = this.obj.room.floor.x+this.obj.x2;
            this.y2 = this.obj.room.floor.y+this.obj.y2;

            this.drawText.content = this.obj.name;


            this.markupCoords = [
                [this.x1,this.y1],
                [this.x1,(this.y1+this.y2)/2],
                [(this.x1+this.x2)/2,this.y1]
            ]

            this.drawMarkup[0].content = '('+MyMath.round(this.obj.x1,2)+','+MyMath.round(this.obj.y1,2)+')';
            this.drawMarkup[1].content = MyMath.round(MyMath.pointDistance(
                {x:this.obj.x1,y:this.obj.y1},{x:this.obj.x1,y:this.obj.y2}),2)+'m';
            this.drawMarkup[2].content = MyMath.round(MyMath.pointDistance(
                {x:this.obj.x1,y:this.obj.y1},{x:this.obj.x2,y:this.obj.y1}),2)+'m';

        },function () {
            return [
                {type:"moveobject",index:0,search:"furniture",x:(this.x1+this.x2)/2,y:(this.y1+this.y2)/2},
                {type:"movepoint",index:1,search:null,x:this.x1,y:this.y1},
                {type:"movepoint",index:2,search:null,x:this.x2,y:this.y2}]
        },
        3)

    elements.push(e);
    return e;

}


function addNodeElement(node) {



    e = new PointElement(node,"node","node",
        "#a400c1",
        "#a400c1",
        "circle",
        function () {
            this.x = this.obj.floor.x+this.obj.x;
            this.y = this.obj.floor.y+this.obj.y;

            this.drawText.content = this.obj.id;
        },null,0
    )
    elements.push(e);
    return e;
}

function addDoorElement(door) {

    e = new DoorElement(door,"door","door",
        '#c16149',
        '#000000',
        function () {
            this.x1 = this.obj.floor.x+this.obj.x1;
            this.y1 = this.obj.floor.y+this.obj.y1;
            this.x2 = this.obj.floor.x+this.obj.x2;
            this.y2 = this.obj.floor.y+this.obj.y2;

            this.drawText.content = this.obj.id+' {'+(this.obj.room1 ? this.obj.room1.id:'_') +','+this.obj.room2.id+'}';

            this.width = this.obj.width;

            this.direction1 = null;
            this.direction2 = null;

            if (this.obj.wall1)
                this.direction1 = Math.atan2(this.obj.wall1.y2-this.obj.wall1.y1,this.obj.wall1.x2-this.obj.wall1.x1)/Math.PI*180-90;

            if (this.obj.wall2)
                this.direction2 = Math.atan2(this.obj.wall2.y2-this.obj.wall2.y1,this.obj.wall2.x2-this.obj.wall2.x1)/Math.PI*180-90;

            if (!this.obj.wall1)
                this.direction1 = this.direction2-180;

            if (!this.obj.wall2)
                this.direction2 = this.direction1-180;



            this.markupCoords = [
                [(this.x1+this.x2)/2,(this.y1+this.y2)/2]
            ]

            this.drawMarkup[0].content = MyMath.round(MyMath.pointDistance(
                {x:this.obj.x1,y:this.obj.y1},{x:this.obj.x2,y:this.obj.y2}),2)+'m';


        },function () {
            return [
                {type:"moveobject",index:0,search:"door",x:(this.x1+this.x2)/2,y:(this.y1+this.y2)/2},
                {type:"movepoint",index:1,search:null,x:this.x1+0.01,y:this.y1+0.01},
                {type:"movepoint",index:2,search:null,x:this.x2+0.01,y:this.y2+0.01}]
        },1)

    elements.push(e);
    return e;
}

function addEdgeElement(edge) {


    e = new LineElement(edge,"edge","edge",
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
        null,0)

    elements.push(e);
    return e;
}

function addQRElement(qr) {
    e = new PointElement(qr,"qr","qr",
        "#3ba2f1",
        "#3765c2",
        "triangle",
        function () {
            this.x = this.obj.room.floor.x+this.obj.x;
            this.y = this.obj.room.floor.y+this.obj.y;

            this.direction = this.obj.direction;

            this.drawElement.fillColor.alpha = this.obj.canSearch ? 1 : 0;

            this.drawText.content = this.obj.id+(this.obj.canSearch ? ' '+this.obj.name : '')+ ' ('+Math.round(this.obj.direction)+'*)'




            this.markupCoords = [
                [(this.x+this.obj.room.floor.x+this.obj.wall.x1)/2,(this.y+this.obj.room.floor.y+this.obj.wall.y1)/2],
                [(this.x+this.obj.room.floor.x+this.obj.wall.x2)/2,(this.y+this.obj.room.floor.y+this.obj.wall.y2)/2]
            ]

            this.drawMarkup[0].content = MyMath.round(MyMath.pointDistance(
                {x:this.obj.x,y:this.obj.y},{x:this.obj.wall.x1,y:this.obj.wall.y1}),2)+'m';
            this.drawMarkup[1].content = MyMath.round(MyMath.pointDistance(
                {x:this.obj.x,y:this.obj.y},{x:this.obj.wall.x2,y:this.obj.wall.y2}),2)+'m';

        },
        function () {

            return [{type:"moveobject",search:"qr",index:0,
                x:this.x-0.1*Math.cos(this.direction/180*Math.PI),
                y:this.y-0.1*Math.sin(this.direction/180*Math.PI)}]
        },2
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


    if (e)
    {
        //console.log(e);
        elements.splice(eI,1);
        e.drawElement.remove();
        if (typeof  e.drawText != "undefined")
            e.drawText.remove();

        if (typeof e.drawMarkup != "undefined")
        {
            for (var i=0;i<e.markupNumber;i++)
                e.drawMarkup[i].remove();
        }
    }

}

function mainOnLoad() {
    //myTool = new MyTool();
}

function init()
{



    project.activeLayer.removeChildren();


    backScale = 1;
    /*backImage = new Raster('test');
    backImage.applyMatrix = false;

    backImage.opacity = 0.3;*/

    backImage = null;


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






    for (var l=-50;l<300;l++)
    {


        var line = new LineElement(null,"grid","grid",'#d8effa',null,1,null,null,0);
        line.setCoords(l,-50,l,400)
        elements.push(line)


        line = new LineElement(null,"grid","grid",'#d8effa',null,1,null,null,0);
        line.setCoords(-50,l,400,l)

        elements.push(line)


    }




   // updateAll();
}



function removeBackImage() {

    if (backImage!==null)
    {
        backImage.remove();
        backImage = null;
    }
}
function setBackImage(id) {
    removeBackImage();


    backImage = new Raster(id);
    backImage.opacity = 0.3;
    backScale = 1;
    backImage.applyMatrix = 0;
}
function setBackImageScale(s) {
    backScale = s;

}

function updateAll()
{

    if (backImage!==null)
    {
        var k = mainScale/50*backScale;
         backImage.scaling = new Point(k,k)
        backImage.position = new Point(backImage.width/2*k,-backImage.height/2*k)+pointToWindow(new Point(0,0));

    }

    elements.forEach(function (e) {
        if (e.updatePosition)
            e.updatePosition();
        e.updatePath();

    })
}


function onMouseDown(event) {

    if (myTool)
    {
        myTool.onMouseDown(new Point(event.event.layerX,event.event.layerY),event.event.button===2);

    }

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


    updateAll();
}

function onScroll(event)
{


    mainScale-=event.deltaY/20;



    if (mainScale<5)
        mainScale = 5;
    if (mainScale>500)
        mainScale = 500;


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


function debugRedLine(fX,fY,points){

    var drawElement = new Path();
    drawElement.strokeColor = '#ff0000';
    drawElement.strokeWidth = 2;

    drawElement.moveTo(pointToWindow(new Point(fX+points[0].x,fY+points[0].y)))
    drawElement.lineTo(pointToWindow(new Point(fX+points[1].x,fY+points[1].y)))


    trDebug.push(drawElement);
}


function debugTriangle(fX,fY,points)
{
    var drawElement = new Path();
    drawElement.strokeColor = '#c7dee0';

    for (var i=0;i<points.length-1;i+=1)
    {
        drawElement.moveTo(pointToWindow(new Point(fX+points[i].x,fY+points[i].y)))
        drawElement.lineTo(pointToWindow(new Point(fX+points[i+1].x,fY+points[i+1].y)))
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


DrawJS.DebugRedLine = debugRedLine;
DrawJS.DebugTriangle = debugTriangle;
DrawJS.RemoveDebugTriangles = removeDebugTriangles;


DrawJS.Init = init;
DrawJS.SetVisibleLayer = setVisibleLayer;

DrawJS.OnScroll = onScroll;

DrawJS.AddFloorElement = addFloorElement;
DrawJS.AddRoomElement = addRoomElement;
DrawJS.AddWallElement = addWallElement;
DrawJS.AddFurnitureElement = addFurnitureElement;

DrawJS.AddEdgeElement = addEdgeElement;
DrawJS.AddNodeElement = addNodeElement;

DrawJS.AddDoorElement = addDoorElement;
DrawJS.AddQRElement = addQRElement;

DrawJS.AddElevatorElement = addElevatorElement;
DrawJS.AddStaircaseElement = addStaircaseElement;

DrawJS.AskInput = askInput;

DrawJS.OnLoad = mainOnLoad;

DrawJS.DestroyElement = destroyElement;

DrawJS.UpdateCanvas = updateAll;

DrawJS.SetBackImage = setBackImage;
DrawJS.SetBackImageScale = setBackImageScale;
DrawJS.RemoveBackImage = removeBackImage;