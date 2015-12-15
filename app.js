function setHeaders(xhr,headerobj){
    for (var headername in headerobj) {
        xhr.setRequestHeader(headername, headerobj[headername]);
    }
}
function logParsedResponse(e){
    if (this.readyState === 4 && this.status === 200) {
        var res = JSON.parse(this.response);
        var headers = this.getAllResponseHeaders();
        console.log(headers);
        console.log(res);
        var lrs = $('#request').val();
        if (res.more) {
            var newlrs = lrs.replace(/\/larissa\/xAPI\/statements.*$/, "");
            $('#request').val(newlrs + res.more);
        }
    }
}

function xmlPostLogged (url, headers, data) {
    var req = new XMLHttpRequest();
    req.open("POST",url);
    setHeaders(req,headers);
    req.onreadystatechange = logParsedResponse;
    req.send(JSON.stringify(data));
}

function xmlGetLogged (url, headers) {
    var req = new XMLHttpRequest();
    req.open("GET",url);
    setHeaders(req,headers);
    req.onreadystatechange = logParsedResponse;
    req.send(null);
}

var headers = {
    "Authorization": "",
    "Content-Type": "application/json",
    "X-Experience-API-Version": "1.0.1"
};

var data = {
    actor: {
        objectType: "Agent",
        mbox: "mailto:shto@blat.com"
    },
    verb: {
        id: "http://adlnet.gov/expapi/verbs/scored",
        display: {
            "en-US": "scored"
        }
    },
    object: {
        objectType: "Activity",
        id: "http://rusticisoftware.github.com/TinCanJS"
    }
};
