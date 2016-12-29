//define our model
/*
Schedule
-Days
--SchoolBlocks
*/
function Schedule(studentName, yearLevel) {
    this.studentName = studentName;
    this.yearLevel = yearLevel;
    this.days = [];
    this.pushDays = function (_day) {
        this.days.push(_day);
    }
    this.buildSchedule = function () {
        //TODO
        return "nothing yet";
    }
}

function Day(name) {
    this.SchoolBlocks = [];
    this.pushSchoolBlocks = function (_class) {
        this.SchoolBlocks.push(_class);
    }
    this.dayName = name;
}

function SchoolBlocks(name, startTime, endTime, teacherName, periodName, classroom) {
    this.name = name;
    this.startTime = startTime;
    this.endTime = endTime;
    this.teacherName = teacherName;
    this.periodName = periodName;
    this.classroom = classroom;
}

var mySchedule;

var textTools = (function () {
    var pub = {};
    pub.convertNameToObject = function(string) {
        var nameArray = string.match(/[A-Z][a-z]+/g); //match all words
        var name = {
            prefName : "",
            firstName : "",
            lastName : ""
        };
        nameArray.push(nameArray.splice(0,1)[0]); //convert to right order.


        //TODO: Check for middle name.
        //prefName is shorter than firstName
        name.prefName = (nameArray[0].length<nameArray[1].length) ? nameArray[0] : nameArray[1];
        name.firstName = (nameArray[1].length<nameArray[0].length) ? nameArray[0] : nameArray[1];
        name.lastName = nameArray[2];
        return name;
    }
    pub.parseData = function (strArray) {

        //data need to parse:
        /*
        -name
        -startTime
        -endTime
        -teacherName
        -periodName
        -classroom
        */
        var data = {};

        //parse name
        data.name = strArray[0];

        //test if there is time in data block 1 (for some)
        timeInIndex0 = strArray[0].search(/-\s[0-9]+:[0-9]+/g);
        if(timeInIndex0>0)
        {
            data.name = strArray[0].replace(/-\s[0-9]+:[0-9]+/g,"").trim();
        }

        //console.log(strArray);
        //parse the times


        //quicky hacky to get Break 2 working since it stores the time in the first element instead
        //time is either in i=1, or i=2.
        var timeIndex;
        try {
            if (typeof strArray[1] !== 'undefined')
                timeIndex = 1;
            else
                timeIndex = 0;
        } catch (error) {
            //ignore
        }

        var timeMatches = strArray[timeIndex].match(/[0-9]+:[0-9]+/g);
        for (var i = 0; i < timeMatches.length; i++) {
            timeMatches[i] = timeMatches[i].replace(":", "");
            if (timeMatches[i].length < 4) {
                timeMatches[i] = '0' + timeMatches[i];
            }
        }

        data.startTime = timeMatches[0];
        data.endTime = timeMatches[1];


        //parse the periodName if possible, otherwise write unknown again love the quicky hacky
        try {
            if (typeof strArray[1] !== 'undefined')
                data.periodName = strArray[1].match(/(?:\(Period\s)((.+))(?:\))/)[1];                
        } catch (error) {
            data.periodName = "none";
        }


        //parse teacherName and classroom
        try {
            if (typeof strArray[2] !== 'undefined') {
                data.teacherName = strArray[2].split("-")[0].trim();
                data.classroom = strArray[2].split("-")[1].trim();
            }
        } catch (error) {
            data.teacherName = "none";
            data.classroom = "none";
        }

        //console.log(data);
        return data;
    }
    return pub;
})();


//begin parsing

function parse() {

    var scheduleString = document.getElementById("scheduleInput").value;



    var parser = new DOMParser();
    var doc = parser.parseFromString(scheduleString, "text/html");




    //build  mapping between day_id and Letter Date
    var labels = doc.getElementById("labels");
    //console.log(labels.childElementCount);
    var dayIDLists = {};
    for (var i = 0; i < labels.childElementCount; i++) {
        dayIDLists[labels.children[i].className] = labels.children[i].innerHTML;
        //console.log("updated dayidlists with: " + labels.children[i].className + " to " + labels.children[i].innerHTML);
    }


    //setup document, days and blocks arrays
    var scheduleDocument = doc.getElementById("document");
    var scheduleDays = doc.getElementsByClassName("day");
    var scheduleBlocks = scheduleDays[0].getElementsByClassName("block");

    //get the name and year level + some processing
    var studentName, studentYearLevel;
    studentName = doc.getElementById("header").children[0].innerHTML.trim();
    studentYearLevel = doc.getElementById("paragraphs").children[2].innerHTML.match(/[0-9]+/)[0];
    
    
    mySchedule = new Schedule(textTools.convertNameToObject(studentName), studentYearLevel);



    //iterate three levels
    for (var x = 0; x < scheduleDays.length; x++) { //pushes every day of the schedule
        var newDay = new Day(dayIDLists[scheduleDays[x].className.split(" ")[1]]); //get the proper day name by splitting the className from format "day day_20" to "day_20"
        scheduleBlocks = scheduleDays[x].getElementsByClassName("block");
        for (var i = 0; i < scheduleBlocks.length; i++) {  //pushes every class of the day
            var stringArray = scheduleBlocks[i].children[0].innerHTML.split(/\<br\>/g);
            var data = textTools.parseData(stringArray);

            /*//check that all values are defined
            for(key in data)
            {
                assert(typeof data.key !== 'undefined', "Undefined value detected in data." + key);
            }
             */


            var newClass = new SchoolBlocks(
                data.name,
                data.startTime,
                data.endTime,
                data.teacherName,
                data.periodName,
                data.classroom
            );
            newDay.pushSchoolBlocks(newClass);
        }

        mySchedule.pushDays(newDay);
    }

    //add to itembox for display
    var node = document.createElement("text");
    node.innerHTML = JSON.stringify(mySchedule);
    var e = document.getElementById("itembox");
    e.appendChild(node);
    console.log(mySchedule);
}









