const request = require('supertest');
const expect = require('chai').expect;
const tutRequestId = '562d09df82658d19596b51bc';
const commentId = '562d0a8c2c80e35b5902b1dc';
const tutSolutionId = '562d0b212c80e35b5902b1e1';

describe('PUT /api/tutorial-requests/:id/comment', () => {
  it('comments on tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/' + tutRequestId + '/comment')
      .send({message: 'hello, this is a comment on a request!'})
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});


describe('PUT /api/tutorial-solutions/:id/comment', () => {
  it('comments on tutorial solution', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-solutions/' + tutSolutionId + '/comment')
      .send({message: 'hello, this is a comment on a solution!'})
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('PUT /api/comments/:id', () => {
  it('Updates an existing comment', (done) => {
    request('localhost:3000')
      .put('/api/comments/' + commentId)
      .send({message: 'changing my comment here.'})
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('DELETE /api/comments/:id', () => {
  it('Removes an existing comment', (done) => {
    request('localhost:3000')
      .delete('/api/comments/' + commentId)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
