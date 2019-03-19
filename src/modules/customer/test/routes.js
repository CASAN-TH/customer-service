'use strict';
var request = require('supertest'),
    assert = require('assert'),
    config = require('../../../config/config'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    mongoose = require('mongoose'),
    app = require('../../../config/express'),
    Customer = mongoose.model('Customer');

var credentials,
    token,
    mockup;

describe('Customer CRUD routes tests', function () {

    before(function (done) {
        mockup = {
            firstname: "nutnut",
            lastname: "lertlao",
            tel: "0896532655",
            address: [
                {
                    houseno: "55/7",
                    village: "casa-city",
                    street: "lumlukka Road",
                    subdistrict: "บึงคำพร้อย",
                    district: "lumlukka",
                    province: "phathumthani",
                    zipcode: "12150"
                }
            ]
        };
        credentials = {
            username: 'username',
            password: 'password',
            firstname: 'first name',
            lastname: 'last name',
            email: 'test@email.com',
            roles: ['user']
        };
        token = jwt.sign(_.omit(credentials, 'password'), config.jwt.secret, {
            expiresIn: 2 * 60 * 60 * 1000
        });
        done();
    });

    it('should be Customer get use token', (done) => {
        request(app)
            .get('/api/customers')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                done();
            });
    });

    it('should be Customer get by id', function (done) {

        request(app)
            .post('/api/customers')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .get('/api/customers/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var resp = res.body;
                        assert.equal(resp.status, 200);
                        assert.equal(resp.data.firstname, mockup.firstname);
                        assert.equal(resp.data.lastname, mockup.lastname);
                        assert.equal(resp.data.tel, mockup.tel);
                        assert.equal(resp.data.address[0].Houseno, mockup.address[0].Houseno);
                        assert.equal(resp.data.address[0].village, mockup.address[0].village);
                        assert.equal(resp.data.address[0].street, mockup.address[0].street);
                        assert.equal(resp.data.address[0].Subdistrict, mockup.address[0].Subdistrict);
                        assert.equal(resp.data.address[0].district, mockup.address[0].district);
                        assert.equal(resp.data.address[0].province, mockup.address[0].province);
                        assert.equal(resp.data.address[0].zipcode, mockup.address[0].zipcode);
                        done();
                    });
            });

    });

    it('should be Customer post use token', (done) => {
        request(app)
            .post('/api/customers')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                assert.equal(resp.data.firstname, mockup.firstname);
                done();
            });
    });

    it('should be customer put use token', function (done) {

        request(app)
            .post('/api/customers')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                var update = {
                    firstname: 'name update'
                }
                request(app)
                    .put('/api/customers/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .send(update)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var resp = res.body;
                        assert.equal(resp.data.firstname, update.firstname);
                        done();
                    });
            });

    });

    it('should be customer delete use token', function (done) {

        request(app)
            .post('/api/customers')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .delete('/api/customers/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .end(done);
            });

    });

    it('should be customer get not use token', (done) => {
        request(app)
            .get('/api/customers')
            .expect(403)
            .expect({
                status: 403,
                message: 'User is not authorized'
            })
            .end(done);
    });

    it('should be customer post not use token', function (done) {

        request(app)
            .post('/api/customers')
            .send(mockup)
            .expect(403)
            .expect({
                status: 403,
                message: 'User is not authorized'
            })
            .end(done);

    });

    it('should be customer put not use token', function (done) {

        request(app)
            .post('/api/customers')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                var update = {
                    firstname: 'name update'
                }
                request(app)
                    .put('/api/customers/' + resp.data._id)
                    .send(update)
                    .expect(403)
                    .expect({
                        status: 403,
                        message: 'User is not authorized'
                    })
                    .end(done);
            });

    });

    it('should be customer delete not use token', function (done) {

        request(app)
            .post('/api/customers')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .delete('/api/customers/' + resp.data._id)
                    .expect(403)
                    .expect({
                        status: 403,
                        message: 'User is not authorized'
                    })
                    .end(done);
            });

    });

    it('This have customer and add address', function (done) {
        request(app)
            .post('/api/customers')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                assert.equal(resp.data.firstname, mockup.firstname);

                var newCustomer = {
                    firstname: "nutTest",
                    lastname: "lerTest",
                    tel: "0998984658",
                    address: [
                        {
                            houseno: "12/222",
                            village: "junthana",
                            street: "lumlukka Road",
                            subdistrict: "Kukot",
                            district: "lumlukka",
                            province: "phathumthani",
                            zipcode: "12130"
                        }
                    ]
                };
                var oldCusAndNewAddress = {
                    firstname: "nutnut",
                    lastname: "lertlao",
                    tel: "0896532655",
                    address: [
                        {
                            houseno: "12/222",
                            village: "junthana",
                            street: "lumlukka Road",
                            subdistrict: "Kukot",
                            district: "lumlukka",
                            province: "phathumthani",
                            zipcode: "12130"
                        }
                    ]
                }
                request(app)
                    .post('/api/customer/add')
                    .set('Authorization', 'Bearer ' + token)
                    .send(oldCusAndNewAddress)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var resp = res.body;
                        // console.log(resp.data)
                        done();
                    })
            });
    });

    afterEach(function (done) {
        Customer.remove().exec(done);
    });

});