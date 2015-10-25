const request = require('supertest');
const expect = require('chai').expect;
const tutRequestId = '562cbdf5d1795dbd5040fb44';
const tutSolutionId = '562cbe45d1795dbd5040fb49';

describe('PUT /api/tutorial-requests/:id/solution', () => {
  it('adds tutorial-solution to tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/' + tutRequestId + '/comment')
      .send({message: 'hello, this is a comment!'})
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('PUT /api/tutorial-solutions/:id', () => {
  it('Updates an existing solution', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-solutions/' + tutSolutionId)
      .send({content: 'changing my solution here.'})
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('DELETE /api/tutorial-solutions/:id', () => {
  it('Removes an existing tutorial solution', (done) => {
    request('localhost:3000')
      .delete('/api/tutorial-solutions/' + tutSolutionId )
      .send({content: 'changing my comment here.'})
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
