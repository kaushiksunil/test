/**
 * Created by NEX22DX on 10-04-2016.
 */
'use strict';
//const env = require('./config.js').getEnv();
//const servingDirectory = (env === "local") ? 'app' : 'dist';
const servingDirectory = "view";
const express = require('express');
const router = module.exports = express.Router();
const path = require('path');

router.use('/bower_components', express.static(servingDirectory + '/bower_components'));
router.use('/css', express.static(servingDirectory + '/css'));
router.use('/controllers', express.static(servingDirectory + '/controllers'));
router.use('/', express.static(servingDirectory + '/'));

router.use('/', express.static(servingDirectory));

router.get(/^\/*/, serveIndex);// keep it a last route


function serveIndex(req, res) {
    res.sendFile(path.resolve('./' + servingDirectory + '/index.html'));
}






