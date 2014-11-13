// making sure that things work
if (!Modernizr.localstorage) {
	alert("Offline storage is not supported by this browser. You might need to update or change it to continue using this application.");
}

/**
* generates a randum hash between of a string between 1 and 100.000.000
* (one hundred million) to provide unique id's
*/
function generateHash() {
	return hex_md5(String((Math.floor(Math.random() * 100000000) + 1)));
}

// this will decide what's up with the application
var DEBUG = false;

if (app == undefined) {
	var app = {};
}

// debug mode activated
if (DEBUG == true) {
	// prevent issues with localStorage
	localStorage.clear();	

	// default tasks
	// NOTE: using strings in number and booleans because of all the string conversions made both
	// in JSON and HTML .val()
	app.tasks = [{
		id: generateHash(),
		title: "Pack bags",
		note: "Don't forget the gadgets!",
		due: "2014-11-20", // @TODO: use the datetime object
		priority: "2",
		done: "false"
	}, {
		id: generateHash(),
		title: "Review entries",
		note: "Check Zendesk latest entries for info", // @TODO: overflowing makes the task disappear
		due: "",
		priority: "1",
		done: "false"
	}, {
		id: generateHash(),
		title: "Start investigation in Library",
		note: "",
		due: "",
		priority: "3",
		done: "false"
	}, {
		id: generateHash(),
		title: "Evaluate proposal",
		note: "",
		due: "2014-11-18",
		priority: "1",
		done: "false"
	}, {
		id: generateHash(),
		title: "Develop system",
		note: "Web and Mobile Technologies",
		due: "2014-11-23",
		priority: "1",
		done: "true"
	}];

	// store them
	localStorage["tasks"] = JSON.stringify(app.tasks);
}

// retrieve the information
if (localStorage["tasks"] != undefined) {
	app.tasks = JSON.parse(localStorage["tasks"]);	
} else {
	app.tasks = [];
}
// END CONFIG

/**
* Render all the tasks inside the inbox and displays them in the
* task views throughout the application.
*
* data - an array of tasks
* return void
*/
function renderTask(data, which) {
	// set default tasks to incomplete
	var which = typeof which !== 'undefined' ? which : "incomplete";
	var exit = false;

	// make sure only the appropriate tasks are rendered
	switch(which) {
		case "incomplete":
			if (data.done == "true") {
				exit = true;
			}
		break;

		case "complete":
			if (data.done == "false") {
				exit = true;
			}
		break;
	}

	if (exit == true) {
		return;
	}

	item = $(document.createElement("li"))
		.addClass("list-group-item")
		.attr("id", "task-" + data.id);

	action = $(document.createElement("a"))
		.addClass("task task-action task-action-complete")
		.attr("href", "#")
		.attr("data-task", data.id)
		.html('<i class="fa fa-circle-o fa-2x fa-fw"></i>').appendTo(item);

	if (data.note != "") {
		title = data.title + "<br /><small>" + data.note + "</small>";
	} else if (data.due != "") {
		title = data.title + "<br /><small>" + data.due + "</small>";
	} else {
		title = data.title;
	}

	task = $(document.createElement("a"))
		.addClass("task")
		.attr("href", "details/#" + data.id)
		.html(title)
		.appendTo(item);

	$("#task-list").append(item);
}
/**
* adds a new task to the system.
*
* data - an object with all the information {title, note, due, priority}
*/
function addTask(data) {
	// do not add empty tasks
	if (data.title == '') {
		return false;
	}

	data.id = generateHash();
	data.done = false;

	if (data.note == undefined) {
		data.note = "";
	}

	if (data.due == undefined) {
		data.due = "";
	}

	if (data.priority == undefined) {
		data.priority = "";
	}

	if (data.done == undefined) {
		data.done = "false";
	}

	app.tasks.push(data);
	return true;
}

/**
* adds a new task to the system with content only, assuming it
* has been sent from the Inbox view.
*
*/
function addInboxTask() {
	var input = $("#new-task");
	var task = {title: input.val()};
	input.val("");
	if (addTask(task) == true) {
		renderTask(task);
		updateStorage();
	}
}
/**
* sets a task as completed
*
*/
function completeTask(id) {
	var complete;

	// search which item to complete
	$.each(app.tasks, function(index) {
		if (app.tasks[index].id == id) {
			app.tasks[index].done = true;
		}
	});
	
	// remove from ui
	$("#task-" + id).remove();

	// then update
	updateStorage();
}

/**
* updates the localStorage array by serialising it
*
* this may be useful someday
*/
function updateStorage() {
	localStorage["tasks"] = JSON.stringify(app.tasks);
}

// load them and do stuff
$(document).ready(function() {
	for(x = 0; x < app.tasks.length; x++) {
		renderTask(app.tasks[x]);
	}

	// adding tasks from inbox
	$("#add-task").on('click', function() {
		addInboxTask();
	});

	$("#form-add-task").on('submit', function(event) {
		event.preventDefault();
		addInboxTask();
	});

	// completing tasks in inbox
	$("#task-list").on("click", ".task-action-complete", function(event) {
		event.preventDefault();
		var task = $(this).data("task");
		completeTask(task);
		// $("#task-" + task).remove();
	});

	// show advanced options
	$("#more-options").on('click', function(e) {
		e.preventDefault();
		$(this).fadeOut(200, function() {
			$("#options").hide().removeClass("hidden").slideDown(300);
		});
	});

	// load everyting in the details view
	var details = {};
	var path = window.location.pathname;

	// details view code
	// this is terrible code and I should be punished
	if (path.search('details') !== -1) {
		details.hash = window.location.hash.substr(1);

		// fill all the data in the form
		$.each(app.tasks, function(index) {
			if (app.tasks[index].id == details.hash) {
				details.data = app.tasks[index];

				$("#id").val(details.data.id);
				$("#title").val(details.data.title);
				$("#note").val(details.data.note);
				$("#due").val(details.data.due);

				var priority = "";
				switch(details.data.priority) {
					case "1": priority = "high"; break;
					case "2": priority = "normal"; break;
					case "3": priority = "low"; break;
				}

				$("#priority-" + priority).attr("checked", "checked").parent("label").addClass("active");

				var done = null;
				switch(details.data.done) {
					case "true": done = "complete"; break;
					case "false": done = "incomplete"; break;
				}

				$("#task-" + done).attr("checked", "checked").parent("label").addClass("active");
			}
		});

		// @TODO: move to outer scope
		function getCurrentData() {
			return {
				id: $("#id").val(),
				title: $("#title").val(),
				note: $("#note").val(),
				due: $("#due").val(),
				priority: $("input[name='priority']:checked").val(),
				done: $("input[name='done']:checked").val()
			}
		}

		function updateTask(data) {
			$.each(app.tasks, function(index) {
				if (app.tasks[index].id == data.id) {
					app.tasks[index] = data;
				}
			});

			updateStorage();
		}
	
		$("#save").on("click", function() {
			updateTask(getCurrentData());
		});
	}
});