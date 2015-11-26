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

var endpoints = {
    "centaurus": {
        "lrs": "https://centaurus.ic.uva.nl",
        "auth": "cameron:lig89324ehater"
        // "auth": "kettle_fnwi_1:sm0k3m1fy4g0tt3m"
        // "auth": "kettle_cjkr_1:th4t5ju5ty0ur0p1n10nm4n"
        // "auth": "uvaInform_fnwi_1:m4rxFr3udN1cC4g3"
        // "auth": "kettle_fnwi_old:th3dud34b1d35m4n"
    },
    "draco": {
        "lrs": "https://draco.ic.uva.nl",
        "auth": "cameron:lig89324ehater"
    },
    "local": {
        "lrs": "http://ck-pc.ic.uva.nl:8080",
        // "lrs": "http://localhost:8080",
        "auth": "cfk:h3153nb3rg"
    }
};

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