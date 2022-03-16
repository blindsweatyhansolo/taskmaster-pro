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

  // check due date
  auditTask(taskLi);

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

// audit tasks using moment()
var auditTask = function(taskEl) {
  // get date from task
  var date = $(taskEl)
    .find("span")
    .text()
    .trim();

  // (set) convert date to moment object at 5pm (1700 hours) local time (L)
  var time = moment(date, "L").set("hour", 17);

  // remove old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date (isAfter)
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if
    (Math.abs(moment().diff(time, "days")) <= 2) {
      $(taskEl).addClass("list-group-item-warning");
  }
};

// sorting tasks: select by class, set to .sortable (makes every el with matching class into sortable list)
$(".card .list-group").sortable({
  // connectWith to any other lists matching selector class
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  // helper: makes a copy of the dragged element and moves copy instead, prevents click events from triggering on original element
  helper: "clone",
  // activate/deactivate trigger once for all connected lists as soon as dragging starts and stops
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  // over/out trigger when a dragged item enters or leaves a connected list
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  // update triggers when the contents of a list have changed (re-ordered, removed, added, etc)
  update: function() {
    // array to store task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      // add task data to temp array as object
      tempArr.push({
        text: $(this)
          .find("p")
          .text()
          .trim(),
        date: $(this)
          .find("span")
          .text()
          .trim()
      });
    });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] =  tempArr;
    saveTasks();
  },
  stop: function(event) {
    $(this).removeClass("dropover");
  }
});

// make #trash droppable area that accepts any element with matching class
$("#trash").droppable({
  accept: ".card .list-group-item",
  // "touch" means draggable overlaps droppable by any amount
  tolerance: "touch",
  // triggers when accepted draggable is dropped on droppable
  // "ui" variable is an object that contains a property called 'draggable'
  // removes dragged element from dom, triggers update() in sortable
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log(ui);
  },
  out: function(event, ui) {
    console.log(ui);
  }
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

// minDate set to be one day from current date
$("#modalDueDate").datepicker({
  minDate: 1
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

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    // when calendar is closed, force "change" event on 'dateInput'
    onClose: function() {
      $(this).trigger("change");
    }
  });

  // auto focus on new element
  dateInput.trigger("focus");
});

// value of due date changed, get current text, update localStorage, and swap with new elements
$(".list-group").on("change", "input[type='text']", function() {
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

  // pass task's li element into auditTask() to check new date
  auditTask($(taskSpan).closest(".list-group-item"));
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


