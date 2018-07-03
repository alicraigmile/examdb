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

	it('Search by Exam board', function(done) {
		request(app)
			.get('/search/?q=AQA')
			.set('Accept', 'text/html')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});

	it('Search by Qualification', function(done) {
		request(app)
			.get('/search/?q=GCSE')
			.set('Accept', 'text/html')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});

	it('Search by Date', function(done) {
		request(app)
			.get('/search/?q=2018-05-23')
			.set('Accept', 'text/html')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});

	it('Search by Date (today)', function(done) {
		request(app)
			.get('/search/?q=today')
			.set('Accept', 'text/html')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});

	it('Search by Date (tomorrow)', function(done) {
		request(app)
			.get('/search/?q=tomorrow')
			.set('Accept', 'text/html')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});

});

