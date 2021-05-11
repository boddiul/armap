function InterfaceController() {

    this.searchSchemeId = -1;




    this.ClickNewFile = function () {

        EditorJS.NewFile();
    }

    this.ClickOpenFile = function () {
        var fileToLoad = document.getElementById("file-input").files[0];

        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent)
        {
            var textFromFileLoaded = fileLoadedEvent.target.result;


            EditorJS.SetScheme(JSON.parse(textFromFileLoaded));

        };
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

    this.OnRequestIdBox = function () {
        var selection = document.getElementById("requestIdBox" );
        this.searchSchemeId = parseInt(selection.value)


        console.log(this.searchSchemeId);
    }

    this.ClickLoadScheme = function () {


        console.log(this.searchSchemeId);

        EditorJS.LoadScheme(this.searchSchemeId);
    }

    this.ClickUploadScheme = function () {

        EditorJS.UploadScheme();
    }


    this.SetSearchSchemeId = function (id) {

        this.searchSchemeId = id;
        document.getElementById("requestIdBox" ).value = id;


    }

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

    this.ClickCreateGraph = function (i) {
        EditorJS.CreateGraph(i);
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

    this.OnInputParam = function (divId,param) {



        if (param==="name")
        {
            d = document.getElementById(divId);

            //currParamObject.name = d.value;

            EditorJS.SetSelectedObjectParam(param,d.value);
        }



    }


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

    }

    this.paramTypes = ["scheme","floor","room","door","wall","furniture","elevator","staircase","qr"]

    this.UpdateParams = function () {

    }
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

    this.UpdateParams = function (type,obj) {
        switch (type) {
            case "scheme":
                document.getElementById("p_scheme_id").value = obj.id;
                document.getElementById("p_scheme_name").value = obj.name;
                document.getElementById("p_scheme_address").value = obj.address;
                document.getElementById("p_scheme_description").value = obj.description;

                break;
            case "floor":
                document.getElementById("p_floor_id").value = obj.id;
                document.getElementById("p_floor_name").value = obj.name;
                break;

            case "room":
                document.getElementById("p_room_id").value = obj.id;
                document.getElementById("p_room_name").value = obj.name;
                break;

            case "qr":
                document.getElementById("p_qr_id").value = obj.id;
                document.getElementById("p_qr_name").value = obj.name;
                break;


        }
    }

    this.OnLoad = function () {

        document.getElementById("myCanvas").oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }


        this.OnRequestIdBox();

        ["room","elevator","node","edge","door","qr","furniture","staircase"].forEach(function (l) {
            console.log(l)
            this.OnEditorLayerBox(l,true);
            this.OnEditorLayerBox(l,false);
        }.bind(this))

        console.log("changed");


    }
}

