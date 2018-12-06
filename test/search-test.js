import request from 'supertest';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import app from '../src/app';

describe('Search', () => {
    it('Search by Subject', done => {
        request(app)
            .get('/search/?q=Mathematics')
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    it('Search by Exam board', done => {
        request(app)
            .get('/search/?q=AQA')
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    it('Search by Qualification', done => {
        request(app)
            .get('/search/?q=GCSE')
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    it('Search by Date', done => {
        request(app)
            .get('/search/?q=2018-05-23')
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    it('Search by Date (today)', done => {
        request(app)
            .get('/search/?q=today')
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    it('Search by Date (tomorrow)', done => {
        request(app)
            .get('/search/?q=tomorrow')
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });
});
