'use strict';

var request = require('supertest'),
	app = require('../lib/app'),
	chai = require('chai'),
		expect = chai.expect;

describe('Qualification', function() {
	it('List qualifications in JSON', function(done) {
		request(app)
			.get('/qualifications.json')
			.set('Accept', 'application/json')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});
	
	xit('List qualifications in HTML', function(done) {
		request(app)
			.get('/qualifications/')
			.set('Accept', 'text/html')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});

	xit('Providers by qualification JSON', function(done) {
		request(app)
			.get('/qualifications/gcse.json')
			.set('Accept', 'application/json')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.have.property('qualification');
				expect(res.body.programmeOfStudy).to.have.property('id');
				expect(res.body.programmeOfStudy.id).to.not.equal(null);
				expect(res.body.programmeOfStudy).to.have.property('name');
				expect(res.body.programmeOfStudy.name).to.not.equal(null);
				expect(res.body).to.have.property('providers');
				expect(res.body.exams).to.not.equal(null);
				done();
			});
	});

	it('Providers by qualification in HTML', function(done) {
		request(app)
			.get('/qualifications/gcse')
			.set('Accept', 'text/html')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});

});

