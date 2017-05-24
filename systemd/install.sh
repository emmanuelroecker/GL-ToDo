#!/bin/bash
service gltodo stop
rm /etc/systemd/system/gltodo.service
cp gltodo.service /etc/systemd/system
rm /etc/systemd/system/multi-user.target.wants/gltodo.service
cd /etc/systemd/system/multi-user.target.wants
ln -s ../gltodo.service .
systemctl daemon-reload
service gltodo start
systemctl status gltodo

