import request from 'supertest';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import app from '../src/app';

describe('Programme of Study', () => {
    it('Exams by programme of study in JSON', done => {
        request(app)
            .get('/programmesofstudy/1.json')
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('programmeOfStudy');
                expect(res.body.programmeOfStudy).to.have.property('id');
                expect(res.body.programmeOfStudy.id).to.not.equal(null);
                expect(res.body.programmeOfStudy).to.have.property('name');
                expect(res.body.programmeOfStudy.name).to.not.equal(null);
                expect(res.body.programmeOfStudy).to.have.property('Qualification');
                expect(res.body.programmeOfStudy.qualification).to.not.equal(null);
                expect(res.body).to.have.property('exams');
                expect(res.body.exams).to.not.equal(null);
                return done();
            });
    });

    it('Exams by programme of study in HTML', done => {
        request(app)
            .get('/programmesofstudy/1')
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    it('Exams by programme of study in CSV', done => {
        request(app)
            .get('/programmesofstudy/1.csv')
            .set('Accept', 'text/csv')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });
});
