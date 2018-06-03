'use strict';

var request = require('supertest'),
	app = require('../lib/app'),
	chai = require('chai'),
		expect = chai.expect;

describe('Status', function() {
	it('displays the app name', function(done) {
		request(app)
			.get('/status')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200)
				.expect(function(res) {
					expect(res.body.app, 'body.app').to.exist;
				})
				.end(function(err, res) {
					if (err) return done(err);
					done();
				});
		});

	it('displays the app version number', function(done) {
		request(app)
			.get('/status')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
						.expect(200)
					  .expect(function(res) {
								expect(res.body.version, 'body.version').to.exist;
						})
			.expect(200, done);
	});

});

