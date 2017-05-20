#!/usr/bin/env node

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

let express = require('express');
const app = express();
let server = require('http').Server(app);
let sqlite3 = require('sqlite3');
let databaseName = './db.sqlite';
let port = 8011;
let tablename = 'todolist';

app.use(express.static('public'));

let db = new sqlite3.Database(databaseName, (err) => {
    if (err) throw new Error(err);
    db.exec(`create table if not exists ${tablename}(timestamp DATE DEFAULT CURRENT_TIMESTAMP, task)`, (err) => {
        if (err) throw new Error(err);
        server.listen(port, () => {
            webSockerServer();
            console.log(`Server started (port : ${port})`);
        });
    })
});

function webSockerServer() {
    let ws = require('socket.io')(server);

    ws.on('connection', (client) => {
        db.all(`SELECT rowid as id, task FROM ${tablename} ORDER BY timestamp`, function(err, rows) {
            if (err) console.log(err)
            else
                client.emit('tasks', rows);
        });

        client.on('addTask', (task) => {
            db.run(`INSERT INTO ${tablename} (task) VALUES ("${task}")`, function(err) {
                if (err) console.log(err)
                else ws.emit('addTask', { id: this.lastID, task: task });
            });
        });

        client.on('deleteTask', (id) => {
            db.run(`DELETE FROM ${tablename} WHERE rowid=${id}`, function(err) {
                if (err) console.log(err)
                else ws.emit('deleteTask', id);
            });
        });
    });
}