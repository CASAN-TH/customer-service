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
        if (data !== null) {
            var indx = data.address.findIndex(function (indxdata) {
                return indxdata.houseno === req.body.address[0].houseno && indxdata.zipcode === req.body.address[0].zipcode
            })

            if (indx === -1) {
                var updAddress = req.body.address[0]
                data.address.push(updAddress)
                data.save(function (err, newDataAddress) {
                    if (err) {
                        return res.status(400).send({
                            status: 400,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        // console.log('this data for push address');
                        res.jsonp({
                            status: 200,
                            data: newDataAddress
                        });
                    }
                })
            } else {
                // console.log('do noting');
                res.jsonp({
                    status: 200,
                    data: data
                });
            }
        } else {
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
        }
    })
}

exports.checkAddAddress = function (mqdata) {
    var tel = mqdata.customer.tel;
    var cusData = mqdata.customer;
    var userData = mqdata.userCreate;
    Customer.findOne({ tel: tel }, function (err, data) {
        if (data !== null) {
            var indx = data.address.findIndex(function (indxdata) {
                return indxdata.houseno === cusData.address[0].houseno && indxdata.zipcode === cusData.address[0].zipcode
            })

            if (indx === -1) {
                var updAddress = cusData.address[0]
                data.address.push(updAddress)
                data.save(function (err, newDataAddress) {
                    if (err) {
                        return res.status(400).send({
                            status: 400,
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        console.log('this data for push address');
                    }
                })
            } else {
                console.log('do noting');
            }
        } else {
            var newCustomer = new Customer(cusData);
            newCustomer.createby = userData;
            newCustomer.save(function (err, newCusData) {
                if (err) {
                    return res.status(400).send({
                        status: 400,
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    console.log('add customer')
                };
            });
        }
    })
};

exports.addHistoryBuy = function (mqdatas) {
    // console.log(mqdatas)
    for (let i = 0; i < mqdatas.length; i++) {
        var mqdata = mqdatas[i];
        var tel = mqdata.customer.tel;
        var items = mqdata.items
        var d = new Date()
        var dateText = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " " + (d.getHours() + 7) + ":" + d.getMinutes()
        // console.log(dateText)

        Customer.findOneAndUpdate(
            {
                tel: tel
            },
            {
                $push: {
                    historybuy: {
                        date: dateText,
                        items: items
                    }
                }
            },
            {
                new: true
            },
            function (err, data) {
                // console.log(data)
            })
    }
}