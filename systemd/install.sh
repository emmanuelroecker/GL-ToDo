#!/bin/bash
cp gltodo.service /etc/systemd/system
cd /etc/systemd/system/multi-user.target.wants
ln -s ../gltodo.service .

