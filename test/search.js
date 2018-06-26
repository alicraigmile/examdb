'use strict';

var request = require('supertest'),
	app = require('../lib/app'),
	chai = require('chai'),
		expect = chai.expect;

describe('Search', function() {
	it('Search by Subject', function(done) {
		request(app)
			.get('/search/?q=Mathematics')
			.set('Accept', 'text/html')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});

});

