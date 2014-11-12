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
	app.tasks = [{
		id: generateHash(),
		content: "Pack bags",
		note: "Don't forget the gadgets!",
		due: "November 20, 2014", // @TODO: use the datetime object
		priority: 2,
	}, {
		id: generateHash(),
		content: "Review entries",
		note: "Check Zendesk latest entries for info", // @TODO: overflowing makes the task disappear
		due: null,
		priority: 1,
	}, {
		id: generateHash(),
		content: "Start investigation in Library",
		note: null,
		due: null,
		priority: 3,
	}, {
		id: generateHash(),
		content: "Evaluate proposal",
		note: null,
		due: "November 18, 2014",
		priority: 1,
	}];

	// provide blank completed tasks
	app.completed = new Array();

	// store them
	localStorage["tasks"] = JSON.stringify(app.tasks);
	localStorage["completed"] = JSON.stringify(app.completed);
}

// retrieve the information
if (localStorage["tasks"] != undefined) {
	app.tasks = JSON.parse(localStorage["tasks"]);	
} else {
	app.tasks = [];
}

if (localStorage["completed"] != undefined) {
	app.completed = JSON.parse(localStorage["completed"]);
} else {
	app.completed = [];
}
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
		.addClass("list-group-item")
		.attr("id", "task-" + data.id);

	action = $(document.createElement("a"))
		.addClass("task task-action task-action-complete")
		.attr("href", "#")
		.attr("data-task", data.id)
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
	if (data.content == '') {
		return false;
	}

	data.id = generateHash();

	if (data.note == undefined) {
		data.note = null;
	}

	if (data.due == undefined) {
		data.due = null;
	}

	if (data.priority == undefined) {
		data.priority = null;
	}

	if (data.done == undefined) {
		data.done = false;
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
	var task = {content: input.val()};
	input.val("");
	if (addTask(task) == true) {
		renderTask(task);
		updateStorage();
	}
}
/**
* sets a tasks as completed
*
*/
function completeTask(id) {
	var complete;

	// search which item to complete
	$.each(app.tasks, function(index) {
		if (app.tasks[index].id == id) {
			complete = index;
		}
	});
	
	// remove from ui, tasks array, and store in the proper one
	$("#task-" + id).remove();
	app.completed.push(app.tasks[complete]);
	app.tasks.splice(complete, 1);

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
	localStorage["completed"] = JSON.stringify(app.completed);
}

// load them and do stuff
$(document).ready(function() {
	for(x = 0; x < app.tasks.length; x++) {
		renderTask(app.tasks[x], x);
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
});