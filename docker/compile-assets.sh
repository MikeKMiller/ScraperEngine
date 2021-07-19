#!/bin/bash
cd scrapeconfig_ui
npm install
bower install
ember build -e production
