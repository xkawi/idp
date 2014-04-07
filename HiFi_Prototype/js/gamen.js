$(document).ready(function(){
	$("#create-btn").hide();
	$("#badgeDiv").hide();

	var services = [];
	var CSOID = "CSOMISHKATAN";
	var CSOName = "Mishka Tan";

	var fbAppt = new Firebase('https://idpgame.firebaseio.com/'+CSOID+'/customer_appointments');
	var fbTime = new Firebase('https://idpgame.firebaseio.com/'+CSOID+'/availabletime');
	var fbCust = new Firebase('https://idpgame.firebaseio.com/'+CSOID+'/customers');
	var fbServ = new Firebase('https://idpgame.firebaseio.com/'+CSOID+'/services');
	var fbLead = new Firebase('https://idpgame.firebaseio.com/leaderboard');
	
	$("#questPopover").popover({
		html: true,
		content: function(){
			var questList = "<table style='width:250px'><tr><td>Complete a new appointment in 10 minutes!</td><td><a class='btn btn-warning'>Start Now</a></td></tr>";
			questList += "<tr><td>Edit an appointment in 2 minutes!</td><td><a class='btn btn-warning'>Start now</a></td> </tr></table>";
			return questList;
		},
		placement: "bottom",
		title: "Quest(s)",
		container: 'body'
	});
	
	$("#historyPopover").popover({
		html: true,
		content: function(){
			var questList = "<table style='width:250px'><tr><td>7m22s</td><td>73655890</td></tr>";
			questList += "<tr><td>3m12s</td><td>73655821</td> </tr><tr><td>-</td><td>-</td></tr></table> <tr><a class='btn btn-normal'>View more</a></tr>";
			return questList;
		},
		placement: "bottom",
		title: "History",
		container: 'body'
	});

	function compareMilli(a,b) {
		if(a.milli < b.milli) return -1;
		if(a.milli > b.milli) return 1;
		return 0;
	}

	var loadLeaderboard = function(){
		fbLead.once("value", function(snapshots){
			var json = snapshots.val();
			var sortedJson = [];
			json.forEach(function(snap){
				//console.log(snap, snap.CSOID, snap.Rank, snap.Score);
				var d = moment(snap.Score, "HH:mm");
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
				jsonRender.push({ "CSOID": cso, "CSOName": csoname, "Rank": rank, "Score": score.hour()+":"+score.minute() });
				//console.log(i+1, sortedJson[i], score.hour(), score.minute());
			};
			var template = $("#leaderboard-template").html();
			var html5 = Mustache.render(template, jsonRender);
			$("#leaderboard-placeholder").html(html5);
		});
	}
	loadLeaderboard();

	var updateUserScore = function(time){
		var csoid = $("input#csoid").val();
		fbLead.once("value", function(snapshots){
			var csos = snapshots.val();
			var csoindex = 0;
			var csoname = "";
			for (var i = csos.length - 1; i >= 0; i--) {
				var cso = csos[i];
				if (cso.CSOID == csoid){
					csoindex = i;
					csoname = cso.CSOName;
				}
			};
			var path = fbLead.toString() + "/" + csoindex.toString();
			var ref = new Firebase(path);
			ref.update({
				"CSOID": csoid,
				"CSOName": csoname,
				"Score": time
			});
			$('#timerpanel').html("00:00:00");
		});
	}

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
	        //currentTime = 0;
	        TimerPanel.Timer.stop().once();
	    };
	});

	//$("#startTimer").click(function(){
	var startTimer = function(){
		TimerPanel.startTimer();
	}

	//TODO!!!!!
	var counter = 0;
	//$("#stopTimer").click(function(){
	var stopTimer = function() {
		counter += 1;
		TimerPanel.stopTimer();
		var timetaken = $("#timerpanel").html();
		var time = timetaken.substring(0, 5); //MM:ss:ms
		updateUserScore(time);
		var poptitle, popcontent;
		if (counter == 1){
			$('#bronzeBadgeModal').modal('show');
			$('#badgeDiv img').attr("src", "http://cl.ly/UGqv/keyboard.png");
			poptitle = "Bronze Badge"
			popcontent = "Completed 25 Appointment!<br/>pssstt... server 1 more customer within 15min to upgrade the badge!";	
			$('#badgeDiv').show();
		} else if (counter == 2){
			$('#silverBadgeModal').modal('show');
			$('#badgeDiv img').attr("src", "http://cl.ly/UGvr/trybadge.png");
			poptitle = "Silver Badge";
			popcontent = "Completed 26 Appointments!"
			$('#badgeDiv').show();
		}
		var imgsrc = $("#badgeDiv img").attr("src");
		//console.log(poptitle, popcontent, imgsrc);
		$('#badgeDiv').popover({
        	content: function() {
        		var content = "<table>";
        		content += "<tr><td rowspan='2'><img width='72px' src='"+imgsrc+"'></td><td>"+poptitle+"</td></tr>";
        		content += "<tr><td>"+popcontent+"</td></tr></table>"
        		return content;
        	},
        	html: true
		});
		loadLeaderboard();
	};


	var populateCustInfo = function(ic, accno){
		//RENDER CUSTOMER INFO: get all information from firebase
		fbCust.once('value', function(snapshots){
			var cInfo = {};
			snapshots.forEach(function(snap){
				var c = snap.val();
				if (c.accno == accno || c.nric == ic){
					cInfo = c;
					return false;
				}
			}); //loop is stopped
			var template= $("#account-info").html();
			var html = Mustache.render(template, cInfo);
			$("#account-info-panel").html(html);
		});
	};

	var populateServiceList = function(nric, accno){
		//RENDER SERVICE & APPOINTMENT LIST FOR CUSTOMER
		fbAppt.once('value', function(snapshots) {
			var appts = [];
			snapshots.forEach(function(snap){ //get all appointments of the customer
				var c = snap.val();
				if (c.CustomerAccNo == accno || c.nric == nric){
					appts = c.services;
					//console.log(c.CustomerAccNo, c.services);
				}
			});
			//console.log(appts);
			var temp2 = $("#serv-list").html();
			var html2 = Mustache.render(temp2, appts);
			$("#huscontent").html(html2);
			$("#create-btn").show();
		});
	};

	var makeAppointmentForm = function(arr){
		//arr = [ sid, sid ];
		fbServ.once('value', function(snapshots){
			var services = [];
			snapshots.forEach(function(snap){
				var s = snap.val();
				if (arr.indexOf(s.serviceId) != -1 ){
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
			var obj = {
				"serviceId" : sid,
				"serviceType" : stype,
				"selectedTask" : task,
				"selectedDate": date,
				"tasks": tasks,
				"availabletimes": times,
				"apptid": apptid
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
		$("#search-error").html("");
		var nric = $("#nric").val();
		var accno = $("#accno").val();
		if (accno || nric){
			if (accno == "21345678" || nric == "S8071263H" ) { //hard flow; second scenario
				populateCustInfo(nric, accno);
				populateServiceList(nric, accno);
				$("#create-btn").show();
				startTimer();
				/*fbCust.once('value', function(snapshots){
					var allCustomers = snapshots.val();
					var error = false; //on second click, this flag will not be changed to true, coz no error!
					for (var i = allCustomers.length - 1; i >= 0; i--) {
						if(allCustomers[i].error){
							error = true; //first click got error, so set the flag to true, so the if after the for is no executed
							alert("Something wrong with this account!\nPlease Approach Shift Technician for Technical Assistance!");
							
							allCustomers[i].error = false; //but then it has updated after first click
							var newval = allCustomers[i];
							var ref = new Firebase(fbCust.toString() + "/" + i.toString());
							ref.update(newval);
						}
					};
					if(!error){ //hence, if no error, populate table
						populateCustInfo(nric, accno);
						populateServiceList(nric, accno);
						$("#create-btn").show();
						startTimer();
						//$("#timerpanel").timer("start");
					}
				})*/
			} else if (accno == "73655890" || nric == "S8475563H") { //easy flow
				populateCustInfo(nric, accno);
				populateServiceList(nric, accno);
				$("#create-btn").show();
				startTimer();
				//$("#timerpanel").timer("start");
			} else if (accno == "12443170" || nric == "S8061560D"){ //scenario 3
				//dick scenario
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
			alert("please enter nric or account no!");
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
		$('#summaryModal').modal('show');
		var refpath = $(this).data("refpath");
		var apptobj = $(this).data("apptobj");
		//console.log(typeof refpath, refpath.length, refpath, typeof apptobj, apptobj.length);
		if ( refpath.length >= 1 && refpath.length == apptobj.length) {
			//more than one path
			for (var i = refpath.length - 1; i >= 0; i--) {
				var ref = new Firebase(fbAppt.toString()+"/"+refpath[i]); //get appointment's fb full URL
				var newvals = apptobj[i];
				ref.update(newvals);
			}
			stopTimer()
			populateServiceList($("#nric-info").html(), $("#account_no").html());
		} else if ( jQuery.type(refpath) === "string" && !apptobj.length) { //apptobj is NOT undefined, and refpath is string
			//no need loop
			var ref = new Firebase(fbAppt.toString()+"/"+refpath); //get appointment's fb full URL
			var newvals = apptobj;
			ref.update(newvals);
			stopTimer();
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
						"CSOID": "CSOMISHKATAN",
						"CSOName": "Mishka Tan",
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