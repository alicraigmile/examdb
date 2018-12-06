import request from 'supertest';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import app from '../src/app';

describe('Teapot', () => {
    it('Teapots in HTML', done => {
        request(app)
            .get('/teapot')
            .set('Accept', 'text/html')
            .expect('Content-Type', /html/)
            .expect(418)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.not.equal(null);
                return done();
            });
    });

    it('Teapots in JSON', done => {
        request(app)
            .get('/teapot.json')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(418)
            .expect(res => expect(res.body.status, 'status').to.exist)
            .expect(res => expect(res.body.message, 'message').to.exist)
            .end(err => (err ? done(err) : done()));
    });
});
