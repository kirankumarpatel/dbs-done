// making sure that things work
if (!Modernizr.localstorage) {
	alert("Offline storage is not supported by this browser. You might need to update or change it to continue using this application.");
}

// START CONFIG
// provinding a leveled playing field
localStorage.clear();

// default tasks
var tasks = [{
		content: "Pack bags",
		note: "Don't forget the gadgets!",
		due: "November 20, 2014", // @TODO: use the datetime object
		priority: 2
	}, {
		content: "Review entries",
		note: "Check Zendesk latest entries for info", // @TODO: overflowing makes the task disappear
		due: null,
		priority: 1	
	}, {
		content: "Start investigation in Library",
		note: null,
		due: null,
		priority: 3
	}, {
		content: "Evaluate proposal",
		note: null,
		due: "November 18, 2014",
		priority: 1	
	}];

// store them
localStorage["tasks"] = JSON.stringify(tasks);

// then retrieve them (to test everything out)
tasks = JSON.parse(localStorage["tasks"]);
// END CONFIG

/**
* Render all the tasks inside the inbox and displays them in the
* task views throughout the application.
*
* data - an array of tasks
* return void
*/
function renderTask(data) {
	item = $(document.createElement("li"))
		.addClass("list-group-item");

	action = $(document.createElement("a"))
		.addClass("task task-action task-action-complete")
		.attr("href", "#")
		.html('<i class="fa fa-circle-o fa-2x fa-fw"></i>').appendTo(item);

	if (data.note != null) {
		content = data.content + "<br /><small>" + data.note + "</small>";
	} else if (data.due != null) {
		content = data.content + "<br /><small>" + data.due + "</small>";
	} else {
		content = data.content;
	}

	task = $(document.createElement("a"))
		.addClass("task")
		.html(content)
		.appendTo(item);

	$("#task-list").append(item);
}
/**
* adds a new task to the system.
*
* data - an object with all the information {content, note, due, priority}
*/
function addTask(data) {
	if (data.note == undefined) {
		data.note = null;
	}

	if (data.due == undefined) {
		data.due = null;
	}

	if (data.priority == undefined) {
		data.priority = null;
	}

	console.log("Adding data to array...");
	console.log(data);

	tasks.push(data);
}

function updateStorage() {
	localStorage["tasks"] = JSON.stringify(tasks);
}

// load them
$(document).ready(function() {
	for(x = 0; x < tasks.length; x++) {
		renderTask(tasks[x]);
	}

	// adding task from inbox
	$("#add-task").on('click', function() {
		var input = $("#new-task");
		var task = {content: input.val()};
		input.val("");
		addTask(task);
		renderTask(task);
		updateStorage();
	});
});