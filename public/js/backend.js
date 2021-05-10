


function BackendController() {


    this.LoadScheme = function(id,onComplete,onFail) {
        $.ajax({
            type: "GET",
            url: '/scheme/'+id
        }).done(function(scheme) {
            onComplete(scheme);
        }).fail(function() {
            onFail();
        })

    }
    this.UploadScheme = function(scheme,onComplete,onFail) {

        $.ajax({
            type: "POST",
            url: '/scheme/',
            data: JSON.stringify(scheme),
            contentType: "application/json",
            dataType: "json"
        }).done(function(res) {
            onComplete(res);

        }).fail(function() {
            onFail();
        })
    }


    this.OpenSchemeData = function(id) {


        window.open(window.location.origin+'/scheme/'+id, '_blank')
    }

    this.OpenSchemeInfoData = function(id) {


        window.open(window.location.origin+'/scheme/'+id+'/info', '_blank')
    }

    this.OpenSchemeQRPDF = function(id) {

        window.open(window.location.origin+'/scheme/'+id+'/qrImageDocument', '_blank')
    }

    this.OpenSchemeHelpPDF = function(id) {



        window.open(window.location.origin+'/scheme/'+id+'/qrHelpDocument', '_blank')
    }


}