import { request } from 'supertest';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import app from '../lib/app';

describe('Status', () => {
    it('displays the app name', done => {
        request(app)
            .get('/status')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(res => expect(res.body.app, 'body.app').to.exist)
            .end(err => (err ? done(err) : done()));
    });

    it('displays the app version number', done => {
        request(app)
            .get('/status')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(res => expect(res.body.version, 'body.version').to.exist)
            .expect(200, done);
    });
});
