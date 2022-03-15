var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};


// click event and callback function when clicking task name to edit (event.target equiv)
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();
  var textInput = $("<textarea>") // using HTML syntax opening tag indicates element to be created = $("<element>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus"); // auto highlight input box on click (focus)
});


// blur event triggers whenever user interacts with anything other than the "textarea"
$(".list-group").on("blur", "textarea", function() {
  // get textarea's current value/text
  var text = $(this)
    .val()
    .trim();
  
  // get parent ul's id attribute, will pull and replace "list-" from id
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  
  // get task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // variable names used as placeholders to update tasks array at specific index
  // returns text property of object at given index / call saveTasks()
  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);

});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


