import request from 'supertest';
import { describe, it, xit } from 'mocha';
import { expect } from 'chai';
import app from '../src/app';

describe('Examboard', () => {
    it('List examboards in JSON', done => {
        request(app)
            .get('/examboards.json')
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    xit('List examboards in HTML', done => {
        request(app)
            .get('/examboards/')
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    it('Courses by examboards JSON', done => {
        request(app)
            .get('/examboards/1.json') // changed from 'aqa', when the IDs changed
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    it('Courses by examboards in HTML', done => {
        request(app)
            .get('/examboards/1') // changed from 'aqa', when the IDs changed
            .set('Accept', 'text/html')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });
});
