import request from 'supertest';
import { describe, it, xit } from 'mocha';
import { expect } from 'chai';
import app from '../src/app';

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

    it('Programmes of study by qualification JSON', done => {
        request(app)
            .get('/qualifications/1.json') // was 'gcse'
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('qualification');
                expect(res.body.qualification).to.have.property('id');
                expect(res.body.qualification.id).to.not.equal(null);
                expect(res.body.qualification).to.have.property('name');
                expect(res.body.qualification.name).to.not.equal(null);
                expect(res.body).to.have.property('programmesofstudy');
                expect(res.body.exams).to.not.equal(null);
                return done();
            });
    });

    it('Programmes of study by qualification in HTML', done => {
        request(app)
            .get('/qualifications/1') // was 'gcse'
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });
});
