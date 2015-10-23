var request = require('supertest');
var camo = require('camo');

describe('GET /api/tutorial-requests', () => {
  it('get list of tutorail request', (done) => {
    request('localhost:3000')
      .get('/api/tutorial-requests')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('GET /api/tutorial-requests/:id', () => {
  it('get single tutorial request by id', (done) => {
    request('localhost:3000')
      .get('/api/tutorial-requests/5629f297d319dafb209647a3')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});


describe('POST /api/tutorial-requests', () => {
  it('create a new tutorial request', (done) => {
    request('localhost:3000')
      .post('/api/tutorial-requests')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('PUT /api/tutorial-requests/:id', () => {
  it('update existing tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/5629f297d319dafb209647a3')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('PUT /api/tutorial-requests/:id/flag', () => {
  it('flags tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/5629f297d319dafb209647a3/flag')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('PUT /api/tutorial-requests/:id/vote', () => {
  it('votes on tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/5629f297d319dafb209647a3/vote')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('PUT /api/tutorial-requests/:id/comment', () => {
  it('comments on tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/5629f297d319dafb209647a3/comment')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});


describe('PUT /api/tutorial-requests/:id/solution', () => {
  it('creates tutorial solution for tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/5629f297d319dafb209647a3/solution')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});



describe('DELETE /api/tutorial-requests/:id', () => {
  it('deletes a tutorial request', (done) => {
    request('localhost:3000')
      .delete('/api/tutorial-requests/5629f297d319dafb209647a3')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
