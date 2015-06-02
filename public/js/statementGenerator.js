// UTILITY FUNCTIONS 

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function isUUID(test){
    var result  = (typeof test != 'string') ? false
                : (test.search(/\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}/) != -1) ? true
                : false;
    return result;
}

function randBetween(min,max) {
    return Math.random() * (max - min + 1) + min;
}

function randIntBetween(min,max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randElFromArr(arr) {
    return arr[randIntBetween(0,(arr.length - 1))];
}

function randomTimeBetween(start,end){
    return moment(randIntBetween(Date.parse(start),Date.parse(end))).toISOString().replace(/\.\d\d\d/,'');
}

function obtainRestEndpoint(api,id){
    var root = "http://46.149.20.182:8000/";
    if (typeof id !== 'undefined') {
        return root + api + "/" + id.toString();
    } else {
        return root + api;
    }
}

function formulateQuestion(){
    var sentence = chance.sentence().replace(/\./,"?");
    return sentence;
}

function formulateAssertion(){
    return chance.sentence();
}

function getMedia(){
    var extend = [".jpg",".png",".mp3",".flac",".avi",".mp4"];
    return chance.word() + randElFromArr(extend);
}

function textGenerate(func,limit){
    var arr = [];
    for (var i = 0; i < limit; i++) {
        arr.push(func());
    }
    return arr;
}

function getStudents(people) {
    return people.filter(function(person){
        return person.affiliations.indexOf("student") != -1;
    });
}

function incorporateArray(src,targ) {
    while (src.length) {
        targ.push(src.shift());
    }

}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// REST DATA GENERATION FUNCTIONS

var personConstructor = {  
    personsGenerated: 0,
    personIdArr: [],
    studentIdArr: [],
    facultyIdArr: [],
    selectGender: function(){
        var flip = randIntBetween(0,1);
        if (flip) {
            return "F";
        } else {
            return "M";
        }
    },
    getFirstName: function(){
        return randElFromArr(firstnames).toLowerCase().capitalize();
    },
    getLastName: function(){
        return randElFromArr(lastnames).toLowerCase().capitalize();
    },
//    lastGenerated: "",
    getAffil: function(){
//        if (this.lastGenerated == "student") {
//            this.lastGenerated = "faculty";
//            return "faculty";
//        } else {
//            this.lastGenerated = "student";
//            return "student";
//        }
        var roll = randIntBetween(0,16);
        // UvA QS ranking is one below Monash, which has a 16:1 student:staff ratio
        if (roll < 16) {
            return "student";
        } else {
            return "faculty";
        }
    },
    generatePerson: function(){
        var person = {};
        person.gender = this.selectGender();
        person.givenName = this.getFirstName();
        person.surName = this.getLastName(); 
        person.displayName = person.givenName + " " + person.surName;
        person.affiliations = this.getAffil();
        person.lat = randIntBetween(0,90);
        person.lon = randIntBetween(0,180);
        return person;
    },
    collatePersonIdArr: function(limit){
        for (var i = 0; i < limit; i++) {
            var url = obtainRestEndpoint("persons");
            var person = this.generatePerson();
            $.post(url,person,function(data,text,jq){
                personConstructor.personIdArr.push(data.id);
                if (data.affiliations == "faculty") {
                    personConstructor.facultyIdArr.push(data.id);
                    $(window).trigger("person-added");
                } else if (data.affiliations == "student") {
                    personConstructor.studentIdArr.push(data.id);
                    $(window).trigger("person-added");
                }
            },"json");
        }
        this.personsGenerated++;
    },
    getFacultyIdArr: function(){
        if (this.personsGenerated) {
            return this.facultyIdArr;
        }
    },
    getStudentIdArr: function(){
        if (this.personsGenerated) {
            return this.studentIdArr; 
        }
    },
    getPersonIdArr: function(){
        if (this.personsGenerated) {
            return this.personIdArr;
        }
    }
};

var roomConstructor = {
    bothArraysReady: 0,
    buildingIdArr: [],
    roomIdArr: [],
    nocaps: /[^A-Z0-9]/g,
    caps: /[A-Z]/,
    getBuilding: function(idx){
        return locations[idx];
    },
    generateRooms: function(ixd){
		var bld = this.getBuilding(ixd);
        var bldurl = obtainRestEndpoint("buildings");
        $.post(bldurl,bld,function(data,text,jq){
            var bldid = data.id;
            roomConstructor.buildingIdArr.push(bldid);
	        for (var floors = 0; floors < 4; floors++){     // set number of floors here
	            for (var rms = 0; rms < 5; rms++){          // ditto rooms
			        var rmm = {};
	                var rmbld = obtainRestEndpoint("buildings",bldid);
			        rmm.building = rmbld;
			        rmm.lat = bld.lat;
			        rmm.lon = bld.lon;
	                if (bld.abbr.search(this.caps) == -1) {
	                    rmm.abbr = bld.abbr.toUpperCase();
	                } else {
	    		        rmm.abbr = bld.abbr.replace(this.nocaps, '') + floors + "." + rms;
	                }
	                $.post(obtainRestEndpoint("rooms"),rmm,function(data,text,jq){
	                    roomConstructor.roomIdArr.push(data.id);
	                    $(window).trigger("room-added",{data:roomConstructor.roomIdArr});
	                },"json");               
	            }
	        }
        },"json");  // moved the last part of the function here - 
                    // now the rest of it gets called as part of the callback
    },
    collateRoomIdArr: function(arr) {
        var al = arr.length;
        for (var i = 0; i < al; i++) {
            this.generateRooms(i);
        }
        this.bothArraysReady++;
    },
    getRoomIdArr: function(){
        doink: {
            if (!this.bothArraysReady) {
                console.log("room ID array not ready yet");
                break doink;
            } else {
                return this.roomIdArr;
            }
        }
    },
    getBuildingIdArr: function(){
        donk: {
            if (!this.bothArraysReady){
                console.log("building ID array not ready yet"); // these shouldn't be able to happen but one never knows
                break donk;
            } else {
                return this.buildingIdArr;
            }
        }
    }
};

var courseConstructor = {
    courseIdArr: [],
    sessionIdArr: [],
    generalProperties: {},
    levels: ["HBO-B","HBO-M","WO-B","WO-M","WO-D"],
    languages: ["en","nl"],
    flavors: {
        bgn: {
            ects: 6,
            titleString: "Beginning ",
            sessions: 4,
        },
        inm: {
            ects: 12,
            titleString: "Intermediate ",
            sessions: 8,
        },
        adv: {
            ects: 12,
            titleString: "Advanced ",
            sessions: 16,
        }
    },
    dsmvwl: /[aeiou ]/g,
    randomize: function() {
        this.generalProperties.subject = chance.word().capitalize();
        this.generalProperties.description = chance.sentence();
    },
    generateCourseSeries: function(facultyIds){
        var seriesProperties = {};
        this.randomize();
        seriesProperties.subject = this.generalProperties.subject;
        seriesProperties.description = this.generalProperties.description;
        seriesProperties.level = randElFromArr(this.levels);
        seriesProperties.language = randElFromArr(this.languages);
        var flvr = Object.keys(this.flavors);
        var series = [];
        var fl = flvr.length;
        for (var i = 0; i < fl; i++) {
            var flv = this.flavors[flvr[i]];
            var course = {};
            course.name = flv.titleString + seriesProperties.subject;
            var abbr = flv.titleString + seriesProperties.subject;
            course.abbr = abbr.replace(this.dsmvwl,'');
            course.ects = flv.ects;
            course.description = seriesProperties.description;
            course.level = seriesProperties.level;
            course.language = seriesProperties.language;
            course.lecturers = obtainRestEndpoint("persons",randElFromArr(facultyIds));
            course.schedule = flv.sessions.toString();
            series.push(course);
        }
        return series;
    },
    constructTimeStamps: function(sessions){
        var timeStampArr = [];
        var monthStamps = {
            fourblock: [
                ["01"],
                ["06"]
            ],
            eightblock: [
                ["09","10"],
                ["11","12"],
                ["02","03"],
                ["04","05"]
            ],
            doubleeightblock: [
                ["09","10","11","12"],
                ["02","03","04","05"]
            ]
        };
        var monthArr    = (sessions == 4) ? randElFromArr(monthStamps.fourblock)
                        : (sessions == 8) ? randElFromArr(monthStamps.eightblock)
                        : (sessions == 16) ? randElFromArr(monthStamps.doubleeightblock)
                        : [];
        var stamp = (parseInt(monthArr[0]) > 7) ? "2013-" : "2014-";
        while (monthArr.length) {
            var month = monthArr.shift();
            for (var i = 0; i < 4; i++) {
                var day = 1 + (i * 7);
                // pad with 0s if less than 10
                var dayString = (day < 10) ? "0" + day.toString() : day.toString();
                var time = randIntBetween(9,16);
                var timeString = (time < 10) ? "0" + time.toString() : time.toString();
                timeStampArr.push(stamp + month + "-" + dayString + "T" + timeString + ":00+01:00");
            }
        }
        return timeStampArr;
    },
    generateSessions: function(url,rooms,sessions){
        var sessionStarts = this.constructTimeStamps(sessions);
        var sl = sessionStarts.length;
        for (var i = 0; i < sl; i++) {
            var session = {};
            session.course = url;
            session.room = obtainRestEndpoint("rooms",randElFromArr(rooms));
            session.start = sessionStarts[i];
            session.end = session.start.replace(/T(\d\d)/,function(p1){
                var p2 = p1.substr(1)
                var newtime = parseInt(p2);
                newtime += 2;
                var newtimeString = (newtime < 10) ? "0" + newtime.toString() : newtime.toString();
                return "T" + newtimeString;
            });
            $.post(obtainRestEndpoint("schedule"),session,function(data,text,jq){
                courseConstructor.sessionIdArr.push(data.id);
                $(window).trigger("session-added",{data:courseConstructor.sessionIdArr,count:sessions});
            },"json")
        }
    },
    collateCourseArr: function(facultyIds,roomIds,limit){
        for (var i = 0; i < limit; i++) {
            var seriesArr = this.generateCourseSeries(facultyIds);
            var sal = seriesArr.length;
            for (var j = 0; j < sal; j++) {
                $.post(obtainRestEndpoint("courses"),seriesArr[j],function(data,text,jq){
                    var courseUrl = obtainRestEndpoint("courses",data.id);
                    courseConstructor.courseIdArr.push(data.id);
                    courseConstructor.generateSessions(courseUrl,roomIds,parseInt(data.schedule));
                },"json");
            }
        }
    },
    getCourseIdArr: function(){
        return this.courseIdArr;
    },
    getSessionIdArr: function(){
        return this.sessionIdArr;
    }
};

// TINCAN DATA GENERATION FUNCTIONS 

var tincan = new TinCan ({
    recordStores: [{
//        endpoint: "http://lrs-dev.ic.uva.nl:8080/larissa/xAPI",     // TODO: reverse comments to move to production
        endpoint: "http://46.149.27.91:8080/larissa/xAPI",
        username: "larissa",
        password: "lrstester",
        allowFail: false
    }]
});

var statementSkeleton = {
    "id": "<uuid>",
    "actor": {
        "name": "<displayname>",
        "account": {
            "homePage": "<url>",
            "name": "<displayname>"
        }
    },
    "verb": {
        "id": "http://adlnet.gov/expapi/verbs/<verb>",
        "display": {
            "en-US": "<verb>"
        }
    },
    "object": {
        "id": "<objuri>", // REST framework hook
//        "definition": {
//            "name": {
//                "en-US": "<objname>"
//            },
//            "description": {
//                "en-US": "<objdesc>"
//            }
//        }
    },
//    "context": {
//    }
};

var verbs = {
    "registered": {object:"course"},
    "attended": {object:"session"},
    "interacted": {object:"actor",context:"session"},
    "asked": {object:"question"},
    "answered": {object:"assertion",context:"question_stref"},
    "imported": {object:"media"},
    "shared": {object:"media"},
    "experienced": {object:"media"},
    "preferred": {object:["shared_stref","question_stref","commented_stref","asked_stref","answered_stref"]},
    "commented": {object:"assertion",context:["shared_stref","question_stref"]},
    "responded": {object:"assertion",context:["shared_stref","question_stref"]},
};
var verblist = Object.keys(verbs);

// obvious pragmatic relations between verbs:
// registered : courses YAY
// asked / answered : questions BZZT
// imported / shared / experienced : media POSSIBLY YAY
// preferred / commented / responded : questions/media BZZT
// attended / interacted : lessons (schedule) YAY

//var media = textGenerate(getMedia,limit);
// etc etc - other functions formulateQuestion, formulateAssertion

function generateAttendanceStatementPath(arrin) {
    var arrayOfStatements = [];
    var actors = arrin;
    while (actors.length) {
        var actor = actors.shift();
        var coursesLimit = randIntBetween(2,3);
        var coursesToPath = [];
        for (var i = 0; i < coursesLimit; i++) {
            coursesToPath.push(randElFromArr(restfulJSON.courses));
        }
        while (coursesToPath.length) {
	        var course = coursesToPath.shift(); 
		    // register
		    arrayOfStatements.push(generateStatement(
		        actor,
		        "registered",
		        course,
		        "2013-08-31T11:00:00Z"
		    ));
            // go to class
		    var firstSession = getFirstSessionFromCourse(course);
            var firstSessionStatements = sessionStatements(actor,actors,firstSession);
            incorporateArray(sessionStatements(actor,actors,firstSession),arrayOfStatements);
            
            var sess = firstSession;
		    while (getNextSessionFromCurrentSession(sess) != undefined) {
                sess = getNextSessionFromCurrentSession(sess);
                incorporateArray(sessionStatements(actor,actors,sess),arrayOfStatements);
            }
	    }
    }
    return arrayOfStatements;
}

function sessionStatements(actor,others,session){
    var arrayOfStatements = [];
    // one "attended"
    var sessionAttended = (generateStatement(
        actor,
        "attended",
        session,
        session.start
    ));  
    arrayOfStatements.push(sessionAttended);
    // between 0 and 3 "interacted"
    var interacts = randIntBetween(0,3);
    if (others.length) {
	    for (var i = 0; i < interacts; i++) {
	        arrayOfStatements.push(generateStatement(
	            actor,
	            "interacted",
	            randElFromArr(others),
	            randomTimeBetween(session.start,session.end),
                {statement:{objectType:"StatementRef",id:sessionAttended.id}}
	        ));
	    }
    }
    return arrayOfStatements;
}

function getFirstSessionFromCourse(course) {
    var courseSessions = restfulJSON.schedule.filter(function(session){
        return session.course == course.url;
    });
    var startDates = [];
    for (var i = 0; i < courseSessions.length; i++) {
        startDates.push(Date.parse(courseSessions[i].start));
    }
    earliestDate = moment(Math.min.apply(null,startDates)).toISOString();
    earliestSessionArr = courseSessions.filter(function(session){
        return session.start == earliestDate.replace(/\.000/,'');
    });
    return earliestSessionArr[0];
}

function getNextSessionFromCurrentSession(curSession) {
    var courseSessions = restfulJSON.schedule.filter(function(session){
        return session.course == curSession.course;
    });
    var laterSessions = courseSessions.filter(function(session){
        return moment(session.start).isAfter(curSession.start);
    });
    var laterStartDates = [];
    if (laterSessions.length) {
	    for (var i = 0; i < laterSessions.length; i++) {
	        laterStartDates.push(Date.parse(laterSessions[i].start));
	    }
	    var nextSessionStart = moment(Math.min.apply(null,laterStartDates)).toISOString();
	    var nextSessionArr = laterSessions.filter(function(session){
	        return session.start == nextSessionStart.replace(/\.000/,'');
	    });
	    var nextSession = (nextSessionArr.length == 1) ? nextSessionArr[0] : undefined;  // still can't happen, there should only ever be one
	    // UNLESS OF COURSE THE SESSION IS THE LAST IN THE COURSE 
	    // in which case 'undefined' is a highly sensible thing for it to return anyway
	    // so we're good (though this still can't happen because of laterSessions not being filled)
	    return nextSession;
    } else {
        return undefined;
    }
}

function generateStatement(actor,verb,object,timestamp,context){
    var bones = jQuery.extend(true,{},statementSkeleton);
    bones.id = generateUUID();
    bones.actor.name = actor.displayName;
    bones.actor.account.homePage = obtainRestEndpoint("persons");
    bones.actor.account.name = actor.id;
    bones.verb.id = "http://adlnet.gov/expapi/verbs/" + verb;
    bones.verb.display["en-US"] = verb;
    bones.timestamp = timestamp;    // always specify
    bones.object.objectType = (object.hasOwnProperty('affiliations')) ? "Agent"
                            : (isUUID(object.id)) ? "StatementRef"
                            : "Activity";
    if (bones.object.objectType == "Agent") {
        bones.object.name = object.displayName;
        bones.object.account = {
            homePage: obtainRestEndpoint("persons"),
            name: object.id
        };
    } else if (bones.object.objectType == "StatementRef") {
        bones.object.id = object.id;
    } else {
        bones.object.id = object.url;
    }
    if (typeof context !== 'undefined') {
        bones.context = context;
    }
    return bones;
}

// LIMIT DECLARATIONS AND MISC VARS

var places = locations;

var peoplelimit = 100;
var courselimit = 100;

var restfulJSON = {};
window.stopnow = 0;

// INTIAL GENERATION AND CALLBACKS 

personConstructor.collatePersonIdArr(peoplelimit);

$(window).on("person-added", function(){
    if (personConstructor.getPersonIdArr().length == peoplelimit) {
        $(window).trigger("people-done-continue");
    }
});
$(window).on("people-done-continue",function(){
	roomConstructor.collateRoomIdArr(places);
});

$(window).on("room-added",function(evt,payload){
    if (roomConstructor.getRoomIdArr().length == (places.length * 20)) {
        $(window).trigger("rooms-done-continue",{data:payload.data});
    }    
});
$(window).on("rooms-done-continue",function(evt,payload){
    courseConstructor.collateCourseArr(personConstructor.getFacultyIdArr(),payload.data,courselimit);
});

$(window).on("session-added",function(evt,payload){
    if (courseConstructor.getSessionIdArr().length == payload.count) {
        if (!window.stopnow) {
            window.stopnow++;
            // There was probably a reason why this kept happening twice in the absence of the preceding line
            // but I didn't have time to figure out what it was
            $(window).trigger("sessions-done-continue");
        }
    }
});
$(window).on("sessions-done-continue",function(){
    // REPLACE THIS WITH WHATEVER REST SERVICE YOU'RE USING, OBVIOUSLY
    $.get("http://46.149.20.182:8000/",{},function(data,text,jq){
        $(window).trigger("got-things",{data:data});
    },"json");
});

$(window).on("got-things",function(evt,payload){
    var apis = Object.keys(payload.data);
    var apl = apis.length;
    for (var i = 0; i < apl; i++) { 
        var loadpay = [];
        $.ajax({
            url: payload.data[apis[i]],
            success: function(data,text,jq) {
                loadpay = data;
            },
            dataType: "json",
            async: false
        });
        restfulJSON[apis[i]] = loadpay;
        if (Object.keys(restfulJSON).length == apl) {
            $(window).trigger("regular-ordinary-swedish-vitamins-done");
        }
    }
});
$(window).on("regular-ordinary-swedish-vitamins-done",function(){
    var path = generateAttendanceStatementPath(getStudents(restfulJSON.persons));
    tincan.sendStatements(path,function(err,data){
        $(document).trigger("statements_wanted");
    });
});
