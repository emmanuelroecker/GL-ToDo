#!/usr/bin/env nodejs

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

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var r = require('rethinkdb');

var httpport = 8011;
var db = {
    host: 'localhost',
    port: 28015
};
var tablename = 'todolist';

app.use(express.static('public'));

r.connect(db)
    .then(function(dbconnection) {
        r.table(tablename).changes().run(dbconnection).then(function(cursor) {
            cursor.each(function(err, task) {
                io.sockets.emit('tasks', task);
            });
        });
        return dbconnection;
    })
    .then(function(dbconnection) {
        io.on('connection', function(socket) {
            socket.on('addTask', function(task) {
                task.timestamp = new Date();
                r.table(tablename).insert(task).run(dbconnection);
            });
            socket.on('deleteTask', function(task) {
                r.table(tablename).get(task.id).delete().run(dbconnection);
            });

            r.table(tablename).orderBy({ index: 'timestamp' }).run(dbconnection)
                .then(function(cursor) {
                    return cursor.toArray();
                })
                .then(function(result) {
                    socket.emit('tasks', result);
                })
                .error(function(err) {
                    socket.emit('error', 'Erreur serveur');
                    console.log('Failure:', err);
                });
        });
    });

server.listen(httpport, function() {
    console.log('ToDoList Server started on port : ' + httpport);
});