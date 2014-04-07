$(document).ready(function(){
	$("#create-btn").hide();
	$("#badgeDiv").hide();



	// Common functions
	function pad(number, length) {
		var str = '' + number;
		while (str.length < length) {str = '0' + str;}
		return str;
	}

	function formatTime(time) {
		time = time / 10;
		var min = parseInt(time / 6000),
		sec = parseInt(time / 100) - (min * 60),
		hundredths = pad(time - (sec * 100) - (min * 6000), 2);
		return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2) + ":" + hundredths;
	}

	var TimerPanel = new (function(){
		var $timer;
	    var incrementTime = 70; 	    // Timer speed in milliseconds
	    var currentTime = 0; 	    // Current timer position in milliseconds
	    this.startTimer = function() {
	    	$timer = $('#timerpanel');
	    	TimerPanel.Timer = $.timer(updateTimer, incrementTime, true);  
	    };
	    // Output time and increment
	    function updateTimer() {
	    	var timeString = formatTime(currentTime);
	    	$timer.html(timeString);
	    	currentTime += incrementTime;
	    }
	    // Stop/Reset timer
	    this.stopTimer = function() {
	        currentTime = 0;
	        TimerPanel.Timer.stop().once();
	    }
	});

	var startTimer = function(){
		TimerPanel.startTimer();
	}

	//TODO!!!!!
	var counter = 0;
	var stopTimer = function() {
		counter += 1;
		TimerPanel.stopTimer();
		var timetaken = $("#timerpanel").html();
		var time = timetaken.substring(0, 5); //MM:ss:ms
		updateUserScore(time);
		var poptitle, popcontent;
		if (counter == 1){
			$('#bronzeBadgeModal').modal('show');
			$('#badgeDiv a img').attr("src", "http://cl.ly/UGqv/keyboard.png");
			popcontent = "Completed 25 Appointment!<br/>pssstt...<br/>serve 1 more customer<br/>within 15min to upgrade the badge!";	
			$('#badgeDiv').show();
			$('a.badges').attr("href", "http://cl.ly/UGqv/keyboard.png");
			$('a.badges').attr("title", popcontent);
			enableHover();
		} else if (counter == 2){
			$('#silverBadgeModal').modal('show');
			$('#badgeDiv a img').attr("src", "http://cl.ly/UGvr/trybadge.png");
			popcontent = "Completed 26 Appointment!<br/>pssstt...<br/>serve 1 more customer<br/>within 15min to upgrade the badge!"
			$('#badgeDiv').show();
			$('a.badges').attr("href", "http://cl.ly/UGvr/trybadge.png");
			$('a.badges').attr("title", popcontent);
			enableHover();
		}
		loadLeaderboard();
	};

	var services = [];
	var CSOID = "CSOMISHKATAN";
	var CSOName = "Mishka Tan";

	var fbAppt = new Firebase('https://idpgame.firebaseio.com/'+ CSOID + '/customer_appointments');
	var fbTime = new Firebase('https://idpgame.firebaseio.com/'+ CSOID + '/availabletime');
	var fbCust = new Firebase('https://idpgame.firebaseio.com/'+ CSOID + '/customers');
	var fbServ = new Firebase('https://idpgame.firebaseio.com/'+ CSOID + '/services');
	var fbBadges = new Firebase('https://idpgame.firebaseio.com/' + CSOID + '/badges');
	var fbCards = new Firebase('https://idpgame.firebaseio.com/' + CSOID + '/cards');
	var fbLead = new Firebase('https://idpgame.firebaseio.com/leaderboard');

	var ref = new Firebase('https://idpgame.firebaseio.com');
	ref.once('value', function(snapshots){
		var data = snapshots.val();
		var csoids = [];
		for (key in data){
			if (!data.hasOwnProperty(key)){
				continue;
			}
			if (key != "leaderboard"){
				csoids.push({"id": key, "name": data[key]["name"]});
			}
		}
		var template = $("#csoid_template").html();
		var html5 = Mustache.render(template, csoids);
		$("#csoid_select").html(html5);		
	});
	$('body').on( 'change', '#csoid', function () {
		CSOID = $(this).val();
		CSOName = $('#csoid option:selected').html();
		//console.log(this, $(this), CSOName, CSOID);
		fbAppt = new Firebase('https://idpgame.firebaseio.com/'+ CSOID + '/customer_appointments');
		fbTime = new Firebase('https://idpgame.firebaseio.com/'+ CSOID + '/availabletime');
		fbCust = new Firebase('https://idpgame.firebaseio.com/'+ CSOID + '/customers');
		fbServ = new Firebase('https://idpgame.firebaseio.com/'+ CSOID + '/services');
		fbBadges = new Firebase('https://idpgame.firebaseio.com/' + CSOID + '/badges');
		fbCards = new Firebase('https://idpgame.firebaseio.com/' + CSOID + '/cards');
		clearPanels();
		loadCSOCard();
	});
	
	function clearPanels(){
		$('#huscontent').html("");
		$('#account-info-panel').html("");
		$('#accno').val("");
		$("#create-btn").hide();
		TimerPanel.stopTimer();
	}

	var randomCard = function(){
		var rand = Math.floor(Math.random()*10 + 1);
		var win = (Math.random() < 0.6) ? false : true;
		if (win){
			var c = rand.toString() + ".png";
			alert("congrats, you won a card! Check the Cards panel!");
			//update cards
			fbCards.transaction(function(currentData) {
				if (currentData !== null) {
					console.log("before: ", currentData, c)
					currentData.push(c);
					console.log("after: ", currentData);
					return currentData;
				}
			}, function(error, committed, snapshot) {
				if (error) {
					console.log('Transaction failed abnormally!', error);
				} else if (!committed) {
					console.log('We aborted the transaction (because cards already exists).');
				} else {
					console.log('Cards credited!');
					renderCSOCard();
				}
			});
		}
	}

	var getCSOCards = function(fn){
		fbCards.once('value', function(snapshots){
			var data = snapshots.val();
			var cards = [];
			if (data){
				for (var i = data.length - 1; i >= 0; i--) {
					var desc;
					if (data[i] == '1.png') {
						desc = "This cards can be used to improve your score by 10%!";
						//$('<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-toggle="popover" data-title="Card 1" data-content="'+desc+'" data-placement="right">').appendTo('#cardDiv');
					} else if (data[i] == '2.png') {
						desc = "This cards can be used to improve your score by 20%!";
						//$('<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-toggle="popover" data-title="Card 2" data-content="'+desc+'" data-placement="right">').appendTo('#cardDiv');
					}else if (data[i] == '3.png') {
						desc = "This cards can be used to improve your score by 30%!";
						//$('<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-toggle="popover" data-title="Card 3" data-content="'+desc+'" data-placement="right">').appendTo('#cardDiv');
					} else if (data[i] == '4.png') {
						desc = "This cards can be used to improve your score by 40%!";
						//$('<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-toggle="popover" data-title="Card 4" data-content="'+desc+'" data-placement="right">').appendTo('#cardDiv');
					} else if (data[i] == '5.png') {
						desc = "This cards can be used to improve your score by 50%!";
						//$('<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-toggle="popover" data-title="Card 5" data-content="'+desc+'" data-placement="right">').appendTo('#cardDiv');
					} else if (data[i] == '6.png') {
						desc = "This cards can be used to improve your score by 60%!";
						//$('<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-toggle="popover" data-title="Card 6" data-content="'+desc+'" data-placement="right">').appendTo('#cardDiv');
					} else if (data[i] == '7.png') {
						desc = "This cards can be used to improve your score by 70%!";
						//$('<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-toggle="popover" data-title="Card 7" data-content="'+desc+'" data-placement="right">').appendTo('#cardDiv');
					} else if (data[i] == '8.png') {
						desc = "This cards can be used to improve your score by 80%!";
						//$('<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-toggle="popover" data-title="Card 8" data-content="'+desc+'" data-placement="right">').appendTo('#cardDiv');
					} else if (data[i] == '9.png') {
						desc = "This cards can be used to improve your score by 90%!";
						//$('<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-toggle="popover" data-title="Card 9" data-content="'+desc+'" data-placement="right">').appendTo('#cardDiv');
					} else if (data[i] == '10.png') {
						desc = "This cards can be used to improve your score by 95%!";
						//$('<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-toggle="popover" data-title="Card 10" data-content="'+desc+'" data-placement="right">').appendTo('#cardDiv');
					}
					//var el = '<img src="img/cards/'+data[i]+'" class="cardicon" rel="popover" data-title="Card '+i+'" data-content="'+desc+'" data-placement="right">';
					//$(el).appendTo("#cardDiv");
					cards.push({ 'card': data[i], 'desc': desc});
				};
			}
			var template = $("#cards-template").html();
			var html = Mustache.render(template, cards);
			return fn(html);
		});
	}
	var loadCSOCard = function(){
		getCSOCards(function(html){
			$("#cardDiv").html(html);
		});
	};
	loadCSOCard();

	$('body').popover({
	 	selector: '[rel=popover]',
	 	trigger: 'hover'
	 });

	$("#questPopover").popover({
		html: true,
		content: function(){
			var questList = "<table style='width:250px'><tr><td>Complete a new appointment in 10 minutes!</td><td><a class='btn btn-success startbtn'>In process</a></td></tr>";
			//questList += "<tr><td>Edit an appointment in 2 minutes!</td><td><a class='btn btn-warning startbtn'>Start now</a></td> </tr></table>";
			questList += "<tr><td>Edit an appointment in 2 minutes!</td><td><button type='button' class='btn btn-warning startbtn' data-dismiss='modal' id='nextCustomer'>Start now</button></td></tr></table>";
			return questList;
		},
		placement: "bottom",
		title: "Quest(s)",
		container: 'body'
	});

	
	$("#historyPopover").popover({
		html: true,
		content: function(){
			var questList = "<table style='width:250px'><tr><td><b>Time Taken</b></td><b><td><b>Account no</b></td></tr><tr><td>7m22s</td><td>73655890</td></tr>";
			questList += "<tr><td>3m12s</td><td>73655821</td> </tr><tr><td>-</td><td>-</td></tr></table><tr><a class='btn btn-normal'>View more</a></tr>";
			return questList;
		},
		placement: "bottom",
		title: "History",
		container: 'body'

	});
	
	//NEW CODE
	$('html').on('click', function (e) {
		$('[data-toggle="popover"]').each(function () {
			//the 'is' for buttons that trigger popups
			//the 'has' for icons within a button that triggers a popup
			if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
				$(this).popover('hide');
			}
		});
	});

	$("#clear-acc").click(function(e){
		e.preventDefault();
		//location.reload();
		clearPanels();
	});

	function compareMilli(a,b) {
		if(a.milli < b.milli) return -1;
		if(a.milli > b.milli) return 1;
		return 0;
	}

	// var times = ['59:00', '00:00'];
	// function accepts an array of times as the argument
	// requires time to be structured as above
	function getAverageTime(times) {
	    var count = times.length
	    var timesInSeconds = [];
	    for (var i =0; i < count; i++) {
	        // parse
	        var pieces = times[i].split(':');
	        var mins = Number(pieces[0]);
	        var secs = Number(pieces[1]);
	        // find value in seconds of time
	        var totalSecs = mins * 60;
	        totalSecs += secs;
	        // add to array
	        timesInSeconds[i] = totalSecs;
	    }
	    // find average timesInSeconds
	    var total = 0;
	    //console.log(timesInSeconds);
	    for (var j =0; j < count; j++) {
	        total = total + Number(timesInSeconds[j]);
	    }
	    var avg = Math.round(total / count);
	    // turn seconds back into a time
	    var avgMins = Math.floor(avg/60);
	    var avgSecs = avg - (60 * avgMins);
	    // add leading zeros for seconds, minutes
	    avgSecs = ('0' + avgSecs).slice(-2);
	    avgMins = ('0' + avgMins).slice(-2);
	    // your answer
	    //console.log(avgMins, avgSecs);
	    return avgMins+':'+avgSecs;
	}

	var loadLeaderboard = function(){
		fbLead.once("value", function(snapshots){
			var json = snapshots.val();
			var sortedJson = [];
			json.forEach(function(snap){
				//console.log(snap, snap.CSOID, snap.Rank, snap.Score);
				var scores = snap.Score;
				var avgtime = getAverageTime(scores);
				console.log("Time scores: ", scores, "\tAverage Time: ", avgtime)
				var d = moment(avgtime, "mm:ss");
				var unsorted_time = { "CSOID" : snap.CSOID, "CSOName": snap.CSOName, "milli": d.valueOf() };
				sortedJson.push(unsorted_time);
			});
			sortedJson.sort(compareMilli); //it is sorted alr		
			var jsonRender = []; //prepare JSON object to render with template
			for (var i = 0; i <= sortedJson.length - 1; i++) {
				var cso = sortedJson[i].CSOID;
				var csoname = sortedJson[i].CSOName;
				var rank = i+1;
				var score = moment(sortedJson[i].milli);
				jsonRender.push({ "CSOID": cso, "CSOName": csoname, "Rank": rank, "Score": score.minute()+":"+score.seconds() });
				//console.log(i+1, sortedJson[i], score.hour(), score.minute());
			};
			var template = $("#leaderboard-template").html();
			var html5 = Mustache.render(template, jsonRender);
			$("#leaderboard-placeholder").html(html5);
		});
	}
	loadLeaderboard();

	var updateUserScore = function(time){
		//var csoid = $("input#csoid").val();
		fbLead.once("value", function(snapshots){
			var csos = snapshots.val();
			var csoindex = 0;
			var csoscores = [];
			for (var i = csos.length - 1; i >= 0; i--) {
				var cso = csos[i];
				if (cso.CSOID == CSOID){
					csoindex = i;
					csoscores = cso.Score;
				}
			};
			csoscores.push(time);
			var path = fbLead.toString() + "/" + csoindex.toString();
			var ref = new Firebase(path);
			ref.update({
				"CSOID": CSOID,
				"CSOName": CSOName,
				"Score": csoscores,
				"time_modifier": 1.5
			});
			$('#timerpanel').html("00:00:00");
			loadLeaderboard();
		});
	}


	var enableHover = function(){
		xOffset = 10;
		yOffset = 30;

		$("a.badges").hover(function(e){
			this.t = this.title;
			this.title = "";	
			var c = (this.t != "") ? "<br/>" + this.t : "";
			$("body").append("<p id='badge'><img src='"+ this.href +"' alt='Image preview' width='120px' />"+ c +"</p>");								 
			$("#badge")
			.css("top",(e.pageY - xOffset) + "px")
			.css("left",(e.pageX + yOffset) + "px")
			.fadeIn("fast");						
		},
		function(){
			this.title = this.t;	
			$("#badge").remove();
		});	
		$("a.badges").mousemove(function(e){
			$("#badge")
			.css("top",(e.pageY - xOffset) + "px")
			.css("left",(e.pageX + yOffset) + "px");
		});
	}

	var populateCustInfo = function(ic, accno){
		console.log(ic, accno, fbCust.toString());
		//RENDER CUSTOMER INFO: get all information from firebase
		fbCust.once('value', function(snapshots){
			var cInfo = {};
			var data = snapshots.val();
			//console.log(data);
			for (var i = data.length - 1; i >= 0; i--) {
				var c = data[i];
				if (c.accno == accno || c.nric == ic){
					cInfo = c;
					//console.log(cInfo, c.accno);
					//return false;
				}
			};
			//console.log(cInfo);
			var template= $("#account-info").html();
			var html = Mustache.render(template, cInfo);
			$("#account-info-panel").html(html);
		});
	};

	var populateServiceList = function(nric, accno){
		//console.log(nric, accno, fbAppt.toString());
		//RENDER SERVICE & APPOINTMENT LIST FOR CUSTOMER
		fbAppt.once('value', function(snapshots) {
			var appts = [];
			var data = snapshots.val();
			for (var i = data.length - 1; i >= 0; i--) {
				var c = data[i];
				if (c.CustomerAccNo == accno || c.nric == nric){
					appts = c.services;
					//console.log(c.CustomerAccNo, c.services);
				}
			};
			/*snapshots.forEach(function(snap){ //get all appointments of the customer
				var c = snap.val();
				//console.log()
				if (c.CustomerAccNo == accno || c.nric == nric){
					appts = c.services;
					//console.log(c.CustomerAccNo, c.services);
				}
			});*/
			//console.log(snapshots.val(), appts);
			var temp2 = $("#serv-list").html();
			var html2 = Mustache.render(temp2, appts);
			$("#huscontent").html(html2);
			$("#create-btn").show();
		});
	};

	var makeAppointmentForm = function(arr){
		//arr = [ sid, sid ];

		fbServ.once('value', function(snapshots){
			var today = new Date() + 5;
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			if(dd<10) {
				dd='0'+dd
			} 
			if(mm<10) {
				mm='0'+mm
			}
			today = yyyy+'-'+mm+'-'+dd;

			var services = [];
			snapshots.forEach(function(snap){
				var s = snap.val();
				if (arr.indexOf(s.serviceId) != -1 ){
					s.currentdate = today;
					services.push(s);
				}
			});

			var template = $('#make-form').html();
			var html = Mustache.render(template, services);
			$('#huscontent').html(html);
			$("#content-error").html("");
			$("#create-btn").hide();
		});
	}

	var editAppointmentForm = function(sid, stype, task, date, time, apptid, accno){
		fbServ.once('value', function(snapshots){
			var tasks = [];
			var times = [];
			snapshots.forEach(function(snap){
				var s = snap.val();
				if (s.serviceId == sid ){
					tasks = s.tasks;
					times = s.availabletimes;
					return false; //to break loop
				}
			});
			if (accno == "12443170"){
				for (var i = times.length - 1; i >= 0; i--) {
					var t = times[i].value;
					if (t == "1030-1130"){
						times.splice(i, 1);
					}
				}
			}
			for (var i = tasks.length - 1; i >= 0; i--) {
				var t = tasks[i]; //{ "name": ""}
				if (t.name == task){
					t.selected = true;
				}
			};
			for (var i = times.length - 1; i >= 0; i--) {
				var t = times[i]; //{ "id": "", "value"}
				if (t.value == time){
					t.selected = true;
				}
			};

			var today = new Date();
			var dd = today.getDate() + 24;
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			if(dd<10) {
				dd='0'+dd
			} 
			if(mm<10) {
				mm='0'+mm
			} 
			today = yyyy+'-'+mm+'-'+dd;

			var obj = {
				"serviceId" : sid,
				"serviceType" : stype,
				"selectedTask" : task,
				"selectedDate": date,
				"tasks": tasks,
				"availabletimes": times,
				"apptid": apptid,
				"currentdate": today
			}

			var template = $('#edit-appointment-template').html();
			var html = Mustache.render(template, obj);
			$('#huscontent').html(html);
			$("#content-error").html("");
			$("#create-btn").hide();
		});
	}

	$("#search-acc").click(function(e){
		e.preventDefault();
		//$("#search-error").html("");
		var nric = $("#accno").val();
		var accno = $("#accno").val();
		if (accno){
			if (accno.charAt(0) == "S") {
				nric = accno;
			}
			if (accno == "21345678" || accno == "S8071263H" ) { //hard flow; second scenario
				$("#accform").addClass("form-group has-error");
				populateCustInfo(nric, accno);
				populateServiceList(nric, accno);
				$("#create-btn").show();
				startTimer();
				
			} else if (accno == "73655890" || accno == "S8475563H") { //easy flow
				$("#accform").removeClass("has-error");
				populateCustInfo(nric, accno);
				populateServiceList(nric, accno);
				$("#create-btn").show();
				startTimer();
				//$("#timerpanel").timer("start");
			} else if (accno == "12443170" || accno == "S8061560D"){ //scenario 3
				//dick scenario
				$("#accform").removeClass("has-error");
				populateCustInfo(nric, accno);
				populateServiceList(nric, accno);
				$("#create-btn").show();
				startTimer();
				//$("#timerpanel").timer("start");
			} else {
				//alert("invalid nric or accno");
				populateCustInfo(nric, accno);
				populateServiceList(nric, accno);
				$("#create-btn").show();
			}
		} else {
			//alert("please enter nric or account no!");
			$("#accform").addClass("form-group has-error");
			//$('<span class="glyphicon glyphicon-remove form-control-feedback"></span>').insertAfter($('input#accno'));
		}	
	});

$("#create-btn").click(function(){
	$("#content-error").html("");
	if ( $(".service-check:checked").length <= 0){
		$("#content-error").html("please select at least one service(s)");
	} else {
		var arr = [];
		$(".service-check:checked").each(function(){
			var sid = $(this).data("serviceid");
			arr.push(sid);
		});
		makeAppointmentForm(arr);
	}
});

$('#huscontent').on( 'click', '#btn-make-cancel', function () {
	populateServiceList($("#nric-info").html(), $("#account_no").html());
	$("#create-btn").show();  
});

$('#huscontent').on( 'click', '#btn-edit-cancel', function (e) {
	e.preventDefault();
	populateServiceList($("#nric-info").html(), $("#account_no").html());
});

$('#huscontent').on( 'click', '.remove-appointment', function (e) {
	e.preventDefault();
	var sid = $(this).data("serviceid");
	$("form#form-" + sid).remove();
	  	//there could be more than 1 form (including search-account form), hence need to remove by one,
	  	//so we can detect how many create forms are on the html; if no more create form, redirect to homepage
	  	var numOfCreateForms = $("form").length - 1;
	  	if (numOfCreateForms < 1){
	  		populateServiceList($("#nric-info").html(), $("#account_no").html());
	  	}
	  });

$("#huscontent").on('click', '#confirm-appointment', function(){
		//hard flow has a remark
		//$('#summaryModal').modal('show');
		var refpath = $(this).data("refpath");
		var apptobj = $(this).data("apptobj");
		//console.log(typeof refpath, refpath.length, refpath, typeof apptobj, apptobj, apptobj.length);
		if ( typeof refpath === "object" && refpath.length >= 1 && refpath.length == apptobj.length) {
			//more than one path
			for (var i = refpath.length - 1; i >= 0; i--) {
				var ref = new Firebase(fbAppt.toString()+"/"+refpath[i]); //get appointment's fb full URL
				var newvals = apptobj[i];
				ref.update(newvals);
				console.log(ref);
			}
			stopTimer()
			randomCard();
			populateServiceList($("#nric-info").html(), $("#account_no").html());
		} else if ( jQuery.type(refpath) === "string" && apptobj) { //apptobj is NOT undefined, and refpath is string
			//no need loop
			var ref = new Firebase(fbAppt.toString()+"/"+refpath); //get appointment's fb full URL
			var newvals = apptobj;
			//console.log(ref, newvals, fbAppt.toString()+"/"+refpath);
			ref.update(newvals);
			stopTimer();
			randomCard();
			populateServiceList($("#nric-info").html(), $("#account_no").html());
		} else {
			alert("something wrong with confirm-appointment button");
		}
	});

$("#huscontent").on('click', '#unconfirm-appointment', function(){
	populateServiceList($("#nric-info").html(), $("#account_no").html());
});

$('#huscontent').on( 'click', '.edit-appointment-btn', function (e) {
	e.preventDefault();
	var sid = $(this).data("serviceid");
	var stype = $(this).data("servicetype");
	var task = $(this).data("task");
	var date = $(this).data("date");
	var time = $(this).data("time");
		var apptid = $(this).data("apptid"); //get list of appointments first
		var accno = $("#accno").val();
		editAppointmentForm(sid, stype, task, date, time, apptid, accno);		
	});

$('#huscontent').on( 'click', '.cancel-appointment-btn', function (e) {
	e.preventDefault();
	var accno = $("#account_no").html();
		var sid = $(this).data("serviceid"); //other available info: "servicetype", "task", "date", "time"
		var apptid = $(this).data("apptid"); //get list of appointments first
		fbAppt.once('value', function(snapshots){
			var allCustomers = snapshots.val();
			var customerIndex, custServices;
			var serviceIndex, serviceAppts;
			var apptIndex;
			for (var i = 0; i < allCustomers.length; i++) {
				if (allCustomers[i].CustomerAccNo == accno){
					customerIndex = i; //get list of services given serviceid
					custServices = allCustomers[i].services;
				}
			};
			for (var i = 0; i < custServices.length; i++) {
				if (custServices[i].serviceId == sid){
					serviceIndex = i;
					serviceAppts = custServices[i].appointments;
				}
			}
			for (var i = 0; i < serviceAppts.length; i++){
				if (serviceAppts[i].appt_id == apptid){
					apptIndex = i;
				}
			}
			var path = customerIndex.toString() + "/services/" + serviceIndex.toString() + "/appointments/" + apptIndex.toString();					
			var ref = new Firebase(fbAppt.toString() + "/" + path); //get the reference
			var appointment = allCustomers[customerIndex].services[serviceIndex].appointments[apptIndex]; //get an appointment
			appointment.status = "CANCELLED";
			appointment.completed = true;
			ref.update(appointment);
			populateServiceList($("#nric-info").html(), $("#account_no").html());
		});
});

$('#huscontent').on( 'click', '#btn-make-create', function () {
		var forms = $("[id^=form-]").toArray(); //get all the forms and convert to array
		var sid, stype, inputDate, inputTime, inputJobTask, inputRemark;
		var form_data = []; //to hold all form data for further orocessiong
		var missingFields = false;
		var accno = $("#account_no").html(); //console.log(forms);
		for (var i = forms.length - 1; i >= 0; i--) {
			var f = forms[i];
			//console.log(forms[i], f);
			sid = $(f).find("input.serviceId").val();
			stype = $(f).find("input.serviceType").val();
			inputDate = $(f).find("#inputDate-"+sid);  	
			inputTime = $(f).find("#inputTime-"+sid);
			inputJobTask = $(f).find("#inputJobTask-"+sid);
			inputRemark = $(f).find("#inputRemark-"+sid);
			if (inputDate.val() && inputTime.val() && inputJobTask.val()) {
				var form = {
					"accno": accno,
					"sid": sid,
					"stype": stype,
					"input_date": inputDate.val(),
					"input_time": inputTime.val(),
					"input_task": inputJobTask.val(),
					"input_remark": inputRemark.val()
				}
				form_data.push(form);
			} else {
				missingFields = true;
			} 
		};
		if (missingFields){
			alert("required fields are missing!");
		} else {
			//process to summary here
			fbAppt.once('value', function(snapshots){
				var allCustomers = snapshots.val();
				var refpaths = [];
				var newvalues = [];
				var render_appt = [];
				for (var i = form_data.length - 1; i >= 0; i--) {
					var data = form_data[i];
					//console.log(data, "snapshots.val(): ", allCustomers);
					var customerIndex, serviceIndex;
					for (var x = 0; x < allCustomers.length; x++) {
						if (allCustomers[x].CustomerAccNo == data.accno){
							customerIndex = x;
							var custServices = allCustomers[x].services;
							for (var y = 0; y < custServices.length; y++) {
								if (custServices[y].serviceId == data.sid){
									serviceIndex = y;
								}
							}
						}
					}
					//console.log("Index ", customerIndex, serviceIndex)
					var path = customerIndex.toString() + "/services/" + serviceIndex.toString() + "/appointments"; //construct reference
					refpaths.push(path);

	  				var appointment = allCustomers[customerIndex].services[serviceIndex].appointments; //get current [] of Appointments
	  				if (appointment == undefined){
	  					appointment = [];
	  				}
	  				var n = Math.floor(Math.random()*62);
	  				var num = (n<10 ? n : 0);
	  				var cha = (n<36 ? String.fromCharCode(n+55) : "C" );
					var appt_id = cha + num.toString(); //random character from A-Z
					var newAppt = {
						"appt_id": appt_id,
						"created_at": new Date(),
						"CSOID": CSOID,
						"CSOName": CSOName,
						"date": data.input_date,
						"time": data.input_time,
						"task": data.input_task,
						"status": "PENDING",
						"completed": false,
						"remark": data.input_remark
					}
					appointment.push(newAppt); //new appointment added to the value console.log(appointment);
					newvalues.push(appointment);

					var render_info = { //for rendering purpose
						"serviceType": data.stype,
						"date": data.input_date,
						"time": data.input_time,
						"task": data.input_task,
						"remark": data.input_remark
					}
					render_appt.push(render_info);
				}
				//craft data for summary page
				var json = {
					"fb_refpath": JSON.stringify(refpaths),
					"appt_obj": JSON.stringify(newvalues),
					"appointments": render_appt
				}
				var temp2 = $("#summary").html();
				var html2 = Mustache.render(temp2, json);
				$("#huscontent").html(html2); 
			});
}
	});//end for #btn-make-create*/

$('#huscontent').on( 'click', '#btn-edit-save', function () {
		var forms = $("[id^=form-]"); //only 1 form
		var form = forms[0];
		var appointments = []; //for rendering purpose
		var accno = $("#account_no").html();
		var sid = $(form).find("input.serviceId").val();
		var stype = $(form).find("input.serviceType").val();
		var apptid = $(form).find("input.apptid").val();
		var inputDate = $(form).find("#inputDate-"+sid).val();  	
		var inputTime = $(form).find("#inputTime-"+sid).val();
		var inputJobTask = $(form).find("#inputJobTask-"+sid).val();
		var inputRemark = $(form).find("#inputRemark-"+sid).val();

		if (inputDate && inputJobTask && inputTime){ //save the edit
			if (inputDate == "2014-09-26" && inputTime == "1030-1130") {
				alert("This date is not available!");
			} else {
				fbAppt.once('value', function(snapshots){
					var allCustomers = snapshots.val();
					var customerIndex, custServices;
					var serviceIndex, serviceAppts;
					var apptIndex;
					for (var i = 0; i < allCustomers.length; i++) {
						if (allCustomers[i].CustomerAccNo == accno){
							customerIndex = i; //get list of services given serviceid
							custServices = allCustomers[i].services;
						}
					};
					for (var i = 0; i < custServices.length; i++) {
						if (custServices[i].serviceId == sid){
							serviceIndex = i;
							serviceAppts = custServices[i].appointments;
						}
					}
					for (var i = 0; i < serviceAppts.length; i++){
						if (serviceAppts[i].appt_id == apptid){
							apptIndex = i;
						}
					}
					var path = customerIndex.toString() + "/services/" + serviceIndex.toString() + "/appointments/" + apptIndex.toString(); ///0/services/1/appointments/0
					var appointment = allCustomers[customerIndex].services[serviceIndex].appointments[apptIndex]; //get the appointment
					appointment.date = inputDate;
					appointment.time = inputTime;
					appointment.task = inputJobTask;
					appointment.remark = inputRemark;
					var obj = {
						"serviceId": sid,
						"serviceType": stype,
						"date": inputDate,
						"time": inputTime,
						"task": inputJobTask,
						"remark": inputRemark,
						"completed": appointment.completed
					}
					appointments.push(obj);
					//prepare for rendering
					//console.log(typeof appointment, appointment, JSON.stringify(appointment));
					var json = {
						"fb_refpath": path,
						"appt_obj": JSON.stringify(appointment),
						"appointments": appointments
					}
					var temp2 = $("#summary").html();
					var html2 = Mustache.render(temp2, json);
					$("#huscontent").html(html2); 
				});
			}//end if for dick teh scenario
		} else {
			alert("required fields are missing!");
		}
	});
});