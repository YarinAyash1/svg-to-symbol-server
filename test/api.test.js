const request = require('supertest');
const app = require('../src/app');

describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'Hey!',
      }, done);
  });
});

describe('POST /api/v1/convert', () => {
  it('should convert the SVG data and return the modified symbol sprite and the original SVG data', (done) => {
    request(app)
      .post('/api/v1/convert')
      .send({ svgData: '<svg></svg>' })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.body)
          .toHaveProperty('symbol');
        expect(res.body)
          .toHaveProperty('svgId');
        expect(res.body)
          .toHaveProperty('input');
        done();
      });
  });
});
