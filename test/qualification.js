import { request } from 'supertest';
import { describe, it, xit } from 'mocha';
import { expect } from 'chai';
import app from '../lib/app';

describe('Qualification', () => {
    it('List qualifications in JSON', done => {
        request(app)
            .get('/qualifications.json')
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    xit('List qualifications in HTML', done => {
        request(app)
            .get('/qualifications/')
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    xit('Providers by qualification JSON', done => {
        request(app)
            .get('/qualifications/gcse.json')
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('qualification');
                expect(res.body.programmeOfStudy).to.have.property('id');
                expect(res.body.programmeOfStudy.id).to.not.equal(null);
                expect(res.body.programmeOfStudy).to.have.property('name');
                expect(res.body.programmeOfStudy.name).to.not.equal(null);
                expect(res.body).to.have.property('providers');
                expect(res.body.exams).to.not.equal(null);
                return done();
            });
    });

    it('Providers by qualification in HTML', done => {
        request(app)
            .get('/qualifications/gcse')
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });
});
