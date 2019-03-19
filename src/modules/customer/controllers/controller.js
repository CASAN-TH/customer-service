'use strict';
var mongoose = require('mongoose'),
    model = require('../models/model'),
    mq = require('../../core/controllers/rabbitmq'),
    Customer = mongoose.model('Customer'),
    errorHandler = require('../../core/controllers/errors.server.controller'),
    _ = require('lodash');

exports.getList = function (req, res) {
    Customer.find(function (err, datas) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: datas
            });
        };
    });
};

exports.create = function (req, res) {
    var newCustomer = new Customer(req.body);
    newCustomer.createby = req.user;
    newCustomer.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
            /**
             * Message Queue
             */
            // mq.publish('Customer', 'created', JSON.stringify(data));
        };
    });
};

exports.getByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 400,
            message: 'Id is invalid'
        });
    }

    Customer.findById(id, function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            req.data = data ? data : {};
            next();
        };
    });
};

exports.read = function (req, res) {
    res.jsonp({
        status: 200,
        data: req.data ? req.data : []
    });
};

exports.update = function (req, res) {
    var updCustomer = _.extend(req.data, req.body);
    updCustomer.updated = new Date();
    updCustomer.updateby = req.user;
    updCustomer.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.delete = function (req, res) {
    req.data.remove(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.addCus = function (req, res) {
    var tel = req.body.tel
    Customer.findOne({ tel: tel }, function (err, data) {
        // console.log(data);
        if (data === null) {
            var newCustomer = new Customer(req.body);
            newCustomer.createby = req.user;
            newCustomer.save(function (err, newCusData) {
                if (err) {
                    return res.status(400).send({
                        status: 400,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    // console.log('add customer')
                    res.jsonp({
                        status: 200,
                        data: newCusData
                    });
                };
            });
        } else {
            // console.log('this data for push address');
            // console.log(data)
            // console.log(req.body)
            res.jsonp({
                status: 200,
                data: "data"
            });
        }
    })


}
