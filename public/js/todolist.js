/**
 *
 * @package   ToDoList
 * @author    Emmanuel ROECKER <emmanuel.roecker@glicer.com>
 * @author    Rym BOUCHAGOUR <rym.bouchagour@glicer.com>
 * @copyright GLICER
 * @license   MIT
 * @link      http://www.glicer.com
 *
 */

'use strict';

var serverHost = window.location.protocol + '//' + window.location.host;
var socketOptions = {};
if (window.location.pathname !== '/') {
    socketOptions = {
        path: window.location.pathname + '/socket.io'
    };
}
var socket = io.connect(serverHost, socketOptions);

var ulElt = document.getElementById('tasks');
var errorElt = document.getElementById('error');
var dateoptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };

function viewError(message) {
    errorElt.textContent = message;
    errorElt.style.display = 'block';
    setTimeout(function() {
        errorElt.style.display = 'none';
    }, 2000);
}

function addTask(task) {
    var liElt = document.createElement('li');
    liElt.setAttribute('id', task.id);

    var itmElt = document.createElement('span');
    itmElt.classList.add('item');
    itmElt.appendChild(document.createTextNode(task.name));

    var spanElt = document.createElement('span');
    spanElt.classList.add('button');
    spanElt.classList.add('icon-trash');
    spanElt.addEventListener('click', function() {
        socket.emit('deleteTask', task);
    });

    liElt.appendChild(itmElt);
    liElt.appendChild(spanElt);
    ulElt.appendChild(liElt);
}

socket.on('tasks', function(tasks) {

    if (tasks.length) {
        tasks.forEach(function(task) {
            addTask(task);
        });
        return;
    }

    //new task
    if ((!tasks.old_val) && (tasks.new_val)) {
        addTask(tasks.new_val);
        return;
    }

    //delete task
    if ((tasks.old_val) && (!tasks.new_val)) {
        var liElt = document.getElementById(tasks.old_val.id);
        ulElt.removeChild(liElt);
        return;
    }

    //update task
    if (tasks.new_val && tasks.old_val) {
        var liElt = document.getElementById(tasks.new_val.id);
        var item = liElt.getElementsByClassName('item')[0];
        item.textContent = tasks.new_val.name;
        return;
    }
});

socket.on('reconnect', function() {
    ulElt.innerHTML = '';
});

socket.on('connect_error', function(err) {
    ulElt.innerHTML = '';
    viewError('Impossible de se connecteur au serveur');
});

socket.on('error', function(message) {
    viewError(message);
});

var formElt = document.getElementById('addTask');

formElt.addEventListener('submit', function(e) {
    e.preventDefault();

    var elements = e.target.elements;
    var newTask = elements.newtodo.value.trim();

    if (newTask.length <= 0) {
        viewError('Merci d\'indiquer une tâche');
    } else {
        socket.emit('addTask', {
            name: newTask
        });
        e.target.reset();
    }
});