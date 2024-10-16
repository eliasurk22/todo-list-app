document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('task-form');
    const newTaskInput = document.getElementById('new-task');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const taskList = document.getElementById('task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    const errorMessage = document.getElementById('error-message');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    taskForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const taskText = newTaskInput.value.trim();
        const taskDeadline = taskDeadlineInput.value;

        if (!taskText) {
            showError('Task description cannot be empty.');
            return;
        }

        const newTask = {
            text: taskText,
            completed: false,
            editing: false,
            deadline: taskDeadline
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        newTaskInput.value = '';
        taskDeadlineInput.value = '';
    });

    function showError(message) {
        errorMessage.textContent = message;
        setTimeout(() => errorMessage.textContent = '', 3000);
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        completedTaskList.innerHTML = '';

        tasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.classList.toggle('completed', task.completed);

            const taskText = document.createElement('span');
            taskText.textContent = task.text;
            taskItem.appendChild(taskText);

            if (task.deadline) {
                const taskDeadline = document.createElement('span');
                taskDeadline.textContent = ` (Deadline: ${task.deadline})`;
                taskItem.appendChild(taskDeadline);
            }

            const taskButtons = document.createElement('div');
            taskButtons.classList.add('task-buttons');

            const completeButton = document.createElement('input');
            completeButton.type = 'checkbox';
            completeButton.checked = task.completed;
            completeButton.addEventListener('change', () => toggleComplete(index));
            taskButtons.appendChild(completeButton);

            const editButton = document.createElement('button');
            editButton.classList.add('edit-btn');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => editTask(index));
            taskButtons.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteTask(index));
            taskButtons.appendChild(deleteButton);

            taskItem.appendChild(taskButtons);

            if (task.completed) {
                completedTaskList.appendChild(taskItem);
            } else {
                taskList.appendChild(taskItem);
            }
        });

        checkDeadlines();
    }

    function checkDeadlines() {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        tasks.forEach(task => {
            if (task.deadline === today && !task.completed) {
                alert(`Reminder: You have a task due today - "${task.text}"`);
            }
        });
    }

    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    function editTask(index) {
        const task = tasks[index];
        task.editing = true;
        renderTasks();
        const taskItem = taskList.children[index];
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;
        taskItem.replaceChild(input, taskItem.children[0]);
        input.focus();
        input.addEventListener('blur', () => {
            task.text = input.value;
            task.editing = false;
            saveTasks();
            renderTasks();
        });
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }

    renderTasks();

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: tasks.filter(task => task.deadline).map(task => ({
            title: task.text,
            start: task.deadline
        }))
    });
    calendar.render();
});
