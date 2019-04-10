'use strict';
// use model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CustomerSchema = new Schema({
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    tel: {
        type: String,
        unique: true
    },
    address: {
        type: [
            {
                houseno: {
                    type: String
                },
                village: {
                    type: String
                },
                street: {
                    type: String
                },
                subdistrict: {
                    type: String
                },
                district: {
                    type: String
                },
                province: {
                    type: String
                },
                zipcode: {
                    type: String
                }
            }
        ]
    },
    historybuy: {
        type: [
            {
                date: {
                    type: String
                },
                items: {
                    type: [
                        {
                            name: {
                                type: String
                            },
                            option: {
                                type: [
                                    {
                                        name: {
                                            type: String
                                        },
                                        value: {
                                            type: [
                                                {
                                                    name: {
                                                        type: String
                                                    },
                                                    qty: {
                                                        type: Number
                                                    }
                                                }
                                            ]
                                        },
                                    }
                                ]
                            },
                            price: {
                                type: Number
                            },
                            amount: {
                                type: Number
                            }
                        }
                    ]
                }
            }
        ]
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    },
    createby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    },
    updateby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    }
});

mongoose.model("Customer", CustomerSchema);