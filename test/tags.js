const request = require('supertest');
const expect = require('chai').expect;
const testid = '562d09df82658d19596b51bc';



describe('PUT /api/tutorial-requests/:id', () => {
  it('Edits the tags on a tutorial request.', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/' + testid)
      .send({tags: 'tag1,tag2,tag3,tag4,tag5'})
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.tags).to.be.a('array');
        if (err) done(err);
        done();
      });
  });
});
