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


// click event and callback function when clicking task name to edit (event.target equiv)
$(".list-group").on("click", "p", function() {
  // get current text of p element
  var text = $(this)
    .text()
    .trim();
  
    // replace p element with new textarea
  var textInput = $("<textarea>") // using HTML syntax opening tag indicates element to be created = $("<element>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);

  // auto highlight input box on click (focus)
  textInput.trigger("focus");
});


// blur event triggers whenever user interacts with anything other than the "textarea" (loses focus)
$(".list-group").on("blur", "textarea", function() {
  // get textarea's current value/text
  var text = $(this)
    .val()
    .trim();
  
  // get parent ul's id attribute, will pull and replace "list-" from id
  var status = $(this)
    .closest(".list-group")
    .attr("id") // setting one attribute gets an attribute
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


// due date clicked, get current text and swap with new elements
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text") // using two arguments sets an attribute
    .addClass("form-control")
    .val(date);
  // swap out elements
  $(this).replaceWith(dateInput);

  // auto focus on new element
  dateInput.trigger("focus");
});

// value of due date changed, get current text, update localStorage, and swap with new elements
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  // get task's position in list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array, re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  // replace input with span element
  $(this).replaceWith(taskSpan);
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


