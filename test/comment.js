const request = require('supertest');
const expect = require('chai').expect;
const tutRequestId = '56306a0612ecf2bd76fb56fe';
const commentId = '56309ff7b71ea8e27bb68c8e';
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
