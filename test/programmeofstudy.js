'use strict';

var request = require('supertest'),
	app = require('../lib/app'),
	chai = require('chai'),
		expect = chai.expect;

describe('Programme of Study', function() {
	it('Exams by programme of study in JSON', function(done) {
		request(app)
			.get('/programmesofstudy/gcse-mathematics.json')
			.set('Accept', 'application/json')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.have.property('programmeOfStudy');
				expect(res.body.programmeOfStudy).to.have.property('id');
				expect(res.body.programmeOfStudy.id).to.not.equal(null);
				expect(res.body.programmeOfStudy).to.have.property('name');
				expect(res.body.programmeOfStudy.name).to.not.equal(null);
				expect(res.body.programmeOfStudy).to.have.property('qualification');
				expect(res.body.programmeOfStudy.qualification).to.not.equal(null);
				expect(res.body).to.have.property('exams');
				expect(res.body.exams).to.not.equal(null);
				done();
			});
	});

	it('Exams by programme of study in HTML', function(done) {
		request(app)
			.get('/programmesofstudy/gcse-mathematics')
			.set('Accept', 'text/html')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});

	it('Exams by programme of study in CSV', function(done) {
		request(app)
			.get('/programmesofstudy/gcse-mathematics.csv')
			.set('Accept', 'text/csv')
			.expect(200)
			.end(function(err, res) {
				if (err) return done(err);
				expect(res.body).to.not.equal(null);
				done();
			});
	});

});

