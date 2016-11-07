//define our model
/*
Schedule
-Days
--schoolClasses
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
    this.schoolClasses = [];
    this.pushschoolClasses = function (_class) {
        this.schoolClasses.push(_class);
    }
    this.dayName = name;
}

function schoolClasses(name, startTime, endTime, teacherName, periodName, classroom) {
    this.name = name;
    this.startTime = startTime;
    this.endTime = endTime;
    this.teacherName = teacherName;
    this.periodName = periodName;
    this.classroom = classroom;
}

var textTools = (function () {
    var pub = {};
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


        console.log(strArray);
        //parse the times


        //quicky hacky to get Break 2 working since it stores the time in the first element instead
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
            else
                data.periodName = "unknown"
        } catch (error) {
            //ignore as usual
        }


        //parse teacherName and classroom
        try {
            if (typeof strArray[2] !== 'undefined') {
                data.teacherName = strArray[2].split("-")[0].trim();
                data.classroom = strArray[2].split("-")[1].trim();
            } else {
                data.teacherName = "";
                data.classroom = "";
            }
        } catch (error) {

        }

        console.log(data);
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
    console.log(labels.children);
    var dayIDLists = {};
    for (var i = 0; i < labels.childElementCount; i++) {
        dayIDLists[labels.children[i].className] = labels.children[i].innerHTML;
        console.log("updated dayidlists with: " + labels.children[i].className + " to " + labels.children[i].innerHTML);
    }


    //setup document, days and blocks arrays
    var scheduleDocument = doc.getElementById("document");
    var scheduleDays = doc.getElementsByClassName("day");
    var scheduleBlocks = scheduleDays[0].getElementsByClassName("block");

    //get the name and year level + some processing
    var studentName, studentYearLevel;
    studentName = doc.getElementById("header").children[0].innerHTML.trim();
    studentYearLevel = doc.getElementById("paragraphs").children[2].innerHTML.match(/[0-9]+/)[0];
    var mySchedule = new Schedule(studentName, studentYearLevel);



    //iterate three levels
    for (var x = 0; x < scheduleDays.length; x++) { //pushes every day of the schedule
        var newDay = new Day(dayIDLists[scheduleDays[0].className.split(" ")[1]]); //get the proper day name by splitting the className from format "day day_20" to "day_20"
        for (var i = 0; i < scheduleBlocks.length; i++) {  //pushes every class of the day
            var stringArray = scheduleBlocks[i].children[0].innerHTML.split(/\<br\>/g);
            var data = textTools.parseData(stringArray);
            var newClass = new schoolClasses(
                data.name,
                data.startTime,
                data.endTime,
                data.teacherName,
                data.periodName,
                data.classroom
            );
            newDay.pushschoolClasses(newClass);
        }

        mySchedule.pushDays(newDay);
    }

    //add to itembox for display
    var node = document.createElement("text");
    node.innerHTML = JSON.stringify(mySchedule);
    var e = document.getElementById("itembox");
    e.appendChild(node);
}









