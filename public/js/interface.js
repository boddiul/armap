function InterfaceController() {

    //this.searchSchemeId = -1;




    this.ClickNewFile = function () {

        EditorJS.NewFile();
    }

    this.ClickOpenFile = function () {


        var fileToLoad = document.getElementById("file-input").files[0];

        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent)
        {
            var textFromFileLoaded = fileLoadedEvent.target.result;

            try {
                var j = JSON.parse(textFromFileLoaded);
                EditorJS.SetScheme(j);
            }
            catch (e) {
                this.ShowErrorMessage("Выбранный файл не соответсвует JSON-формату")
            }




        }.bind(this);
        fileReader.readAsText(fileToLoad, "UTF-8");
    }


    this.ClickSaveFile = function () {

        var j = EditorJS.GetScheme().ToJSON();
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


    this.OnEditorLayerBox = function(layer,isLabel) {
        var layerId = layer+(isLabel?"Data":"")
        var selection = document.getElementById(layerId+"Box" );

        EditorJS.SetVisibleLayer(layer,isLabel,selection.checked)
        //console.log(selection.checked)
    }




    /*
    this.OnRequestIdBox = function () {
        var selection = document.getElementById("requestIdBox" );
        this.searchSchemeId = parseInt(selection.value)


        console.log(this.searchSchemeId);
    }

    this.ClickLoadScheme = function () {


        console.log(this.searchSchemeId);

        EditorJS.LoadScheme(this.searchSchemeId);
    }



    this.SetSearchSchemeId = function (id) {

        this.searchSchemeId = id;
        document.getElementById("requestIdBox" ).value = id;


    }*/

    this.ClickNewFloor = function () {

        EditorJS.NewFloor();
    }


    this.ClickNewRoom = function () {
        EditorJS.NewRoom();
    }

    this.ClickNewWall = function () {
        EditorJS.NewWall();
    }

    this.ClickNewDoor = function () {
        EditorJS.NewDoor();
    }

    this.ClickNewFurniture = function () {

        EditorJS.NewFurniture();
    }

    this.ClickNewStaircase = function () {
        EditorJS.NewStaircase();
    }

    this.ClickNewElevator = function () {
        EditorJS.NewElevator();
    }

    this.ClickNewQR = function () {
        EditorJS.NewQR();

    }


    this.ClickClearGraph = function () {
        EditorJS.ClearGraph();
    }



    this.ClickCreateGraph = function (full) {

        let graphType = 0;


        let li = document.getElementById("graph_type");

        let tt = li.options[li.selectedIndex].value;
        console.log(tt);
        switch(tt)
        {
            case "none":graphType =0; break;
            case "type1":graphType =1; break;
            case "type2":graphType =2; break;
        }

        EditorJS.CreateGraph(graphType,full);
    }




    this.ClickRemoveDebugTriangle = function () {
        EditorJS.RemoveDebugTriangle();
    }

    this.ClickFixGraph = function () {
        EditorJS.FixGraph();
    }

    this.ClickDestroy = function () {


        EditorJS.DestroySelectedObject();
    }



    this.valueToFloorId = {}

    this.UpdateFloorList = function (floors) {
        this.valueToFloorId = {};

        $("#qr_floor").empty();


        let li = document.getElementById("qr_floor");

        let option = document.createElement( 'option' );
        option.value = 'none';
        option.text = 'Все';
        li.add( option );

        this.valueToFloorId['none'] = -1;

        floors.forEach(function (f) {

            this.valueToFloorId['floor'+f.id] = f.id;

            let option = document.createElement( 'option' );
            option.value = 'floor'+f.id;
            option.text = f.name;
            li.add( option );



        }.bind(this));



    }

    this.ClickQRClear = function () {

        let li = document.getElementById("qr_floor");



        EditorJS.ClearQR(this.valueToFloorId[li.options[li.selectedIndex].value]);
    }

    this.ClickQRGenerate = function () {
        let li = document.getElementById("qr_floor");

        EditorJS.GenerateQR(this.valueToFloorId[li.options[li.selectedIndex].value]);
    }

    this.OnInputParam = function (div,param) {

        d = div;

        if (param==="name" || param==="address" || param==="description")
        {


            //currParamObject.name = d.value;

            EditorJS.SetSelectedObjectParam(param,d.value);
        }
        else if (param === "can_search")
        {
            EditorJS.SetSelectedObjectParam("canSearch",d.checked);
        }
        else if (param==="direction" || param==="width" || param==="height" )
        {

            let val = d.value;
            if (!isNaN(val)) {
                EditorJS.SetSelectedObjectParam(param,val);
                this.UpdateParams(this.currentType,this.currentObj);
            }



        }



    }


    this.ClickRemovePortalLink = function (type,dir) {

        EditorJS.RemovePortalLink(type,dir);
        this.UpdateParams(this.currentType,this.currentObj)
    }

    this.ClickChangePortalLink = function (type,dir) {

        EditorJS.ChangePortalLink(type,dir);
        this.UpdateParams(this.currentType,this.currentObj)
    }
    /*
    this.ClickGetScheme = function () {

        EditorJS.OpenSchemeData(this.searchSchemeId);

    }

    this.ClickGetSchemeInfo = function () {

        EditorJS.OpenSchemeInfoData(this.searchSchemeId);

    }

    this.ClickGetQRPDF = function () {

        EditorJS.OpenSchemeQRPDF(this.searchSchemeId);

        window.open(window.location.origin+'/scheme/'+SEARCH_SCHEME_ID+'/qrImageDocument', '_blank')
    }

    this.ClickGetHelpPDF = function () {

        EditorJS.OpenSchemeHelpPDF(this.searchSchemeId);

    }*/

    this.paramTypes = ["scheme","floor","room","door","wall","furniture","elevator","staircase","qr"]

    this.ShowParams = function (type,obj) {


        //if (! (type==="room" || type==="scheme" || type==="floor" ))
        //    return;


        this.paramTypes.forEach(function (v) {
            d = document.getElementById(v+"_params");
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



        this.UpdateParams(type,obj);


    }


    this.ShowErrorMessage = function (msg) {
        alert(msg);
    }

    this.UpdateParams = function (type,obj) {


        this.currentType = type;
        this.currentObj = obj;

        switch (type) {
            case "scheme":


                break;
            case "furniture":
                document.getElementById("p_furniture_id").value = obj.id;
                document.getElementById("p_furniture_name").value = obj.name;
            case "floor":
                document.getElementById("p_floor_id").value = obj.id;
                document.getElementById("p_floor_name").value = obj.name;




                break;

            case "room":
                document.getElementById("p_room_id").value = obj.id;
                document.getElementById("p_room_name").value = obj.name;
                document.getElementById("p_room_can_search").checked = obj.canSearch;
                break;
            case "wall":
                document.getElementById("p_wall_id").value = obj.id;
                break;
            case "door":
                document.getElementById("p_door_id").value = obj.id;

                document.getElementById("p_door_width_text").value =
                    document.getElementById("p_door_width_bar").value =
                        obj.width;

                break;
            case "qr":
                document.getElementById("p_qr_id").value = obj.id;
                document.getElementById("p_qr_name").value = obj.name;
                document.getElementById("p_qr_can_search").checked = obj.canSearch;

                break;
            case "staircase":
                document.getElementById("p_staircase_id").value = obj.id;



                ['direction','height','width'].forEach(function (p) {
                    document.getElementById("p_staircase_"+p+"_text").value =
                        document.getElementById("p_staircase_"+p+"_bar").value =
                            obj[p];

                })





                document.getElementById("p_staircase_up_id").value  = obj.staircaseUp===null ? 'Нет' : obj.staircaseUp.id;
                document.getElementById("p_staircase_down_id").value  = obj.staircaseDown===null ? 'Нет' : obj.staircaseDown.id;

                break;
            case "elevator":
                document.getElementById("p_elevator_id").value = obj.id;


                document.getElementById("p_elevator_up_id").value  = obj.elevatorUp===null ? 'Нет' : obj.elevatorUp.id;
                document.getElementById("p_elevator_down_id").value  = obj.elevatorDown===null ? 'Нет' : obj.elevatorDown.id;

                break;

        }
    }

    this.OnLoad = function () {

        document.getElementById("myCanvas").oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); };



        ["room","elevator","node","edge","door","qr","furniture","staircase"].forEach(function (l) {
            console.log(l)
            this.OnEditorLayerBox(l,true);
            this.OnEditorLayerBox(l,false);
        }.bind(this));

        let li = document.getElementById("examples_list");



        this.idToInfo = {};
        ["36","33","220","50709"].forEach(function (i) {



            EditorJS.LoadSchemeInfo(i,function (data) {

                /*let b = document.createElement("button");

                b.textContent  = data.name;
                b.setAttribute("onclick", "InterfaceJS.ClickLoadScheme("+i+");");
                plist.appendChild(b);*/

                this.idToInfo[data.id] = data;
                let option = document.createElement( 'option' );
                option.value = data.id;
                option.text = data.name;
                li.add( option );


            }.bind(this))



        }.bind(this))

        console.log("changed");


    }
    this.ClickExample = function () {
        let li = document.getElementById("examples_list");
        let d = this.idToInfo[li.options[li.selectedIndex].value];

        document.getElementById("example_description").textContent = d.description;
    }

    this.ClickGetExampleQRPF = function () {
        let li =document.getElementById("examples_list");

        EditorJS.OpenSchemeQRPDF(li.options[li.selectedIndex].value);
    }
    this.ClickGetExampleHelpPDF = function () {
        let li =document.getElementById("examples_list");

        EditorJS.OpenSchemeHelpPDF(li.options[li.selectedIndex].value);
    }
    this.ClickSelectExample = function () {

        let li = document.getElementById("examples_list");

        EditorJS.LoadScheme(li.options[li.selectedIndex].value);
        this.CloseWindow();
    }


    this.ClickOpenWindowExamples = function () {
        this.OpenWindow('examples');
    }

    this.ClickOpenWindowUpload = function () {

        try {
            EditorJS.CheckScheme();
            this.OpenWindow('scheme_params');
        }
        catch(e)
        {
            this.ShowErrorMessage(e.message);
        }

    }


    this.ClickUploadScheme = function () {

        try {
            EditorJS.CheckScheme();
            EditorJS.UploadScheme();
        }
        catch(e)
        {
            this.ShowErrorMessage(e.message);
        }
    }


    this.ClickOpenWindowHelp = function () {
        this.OpenWindow('help');
    }


    this.overlayIds = ['help','scheme_uploaded','scheme_params','examples']
    this.OpenWindow = function(windowId)
    {
        let w;

        this.overlayIds.forEach(function(i){
            w = document.getElementsByClassName('overlay_'+i)[0];

            w.style.display = i===windowId ? "block" : "none";
        })


        w = document.getElementsByClassName('overlay_window')[0];
        w.style.display = "block";


        switch (windowId) {
            case "scheme_params":
                document.getElementById('p_scheme_name').value = EditorJS.scheme.name;
                document.getElementById('p_scheme_address').value = EditorJS.scheme.address;
                document.getElementById('p_scheme_description').textContent = EditorJS.scheme.description;
                break;
            case "scheme_uploaded":
                document.getElementById('uploaded_id').textContent = EditorJS.scheme.id;
                document.getElementById('uploaded_name').textContent = EditorJS.scheme.name;
                break;
            case "examples":

                this.ClickExample();
                break;
        }

    }

    this.CloseWindow = function () {
        let w = document.getElementsByClassName('overlay_window')[0];
        w.style.display = "none";
    }



    this.ClickGetQRPDF = function () {

        EditorJS.OpenSchemeQRPDF();

    }

    this.ClickGetHelpPDF = function () {

        EditorJS.OpenSchemeHelpPDF();

    }


    this.hintText ="";
    this.SetHint = function (text) {

        if (text!==this.hintText)
        {
            let d = document.getElementById("toolbar_hint");
            if (text==="")
            {
                d.style.display = "none";
            }
            else
            {
                d.style.display = "block";
                t = document.getElementById("toolbar_hint_text");
                t.textContent = text;
            }

            this.hintText = text;
        }

    }

}

