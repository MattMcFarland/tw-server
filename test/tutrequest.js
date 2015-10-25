const request = require('supertest');
const expect = require('chai').expect;
const testid = '562cbdf5d1795dbd5040fb44';

function expectBaseProps(data) {
  expect(data.comments, 'data[comments]');
  expect(data.solutions, 'data[solutions]');
  expect(data.tags, 'data[tags]');
  expect(data.permalink, 'data[permalink]');
  expect(data.title, 'data[title]');
  expect(data.author, 'data[author]');
  expect(data.created_at, 'data[created_at]');
  expect(data.updated_at, 'data[updated_at]');
  expect(data.removed, 'data[removed]');
  expect(data.id, 'data[id]');
  expect(data.authorName, 'data[authorName]');
  expect(data.authorUrl, 'data[authorUrl]');
  expect(data.flags, 'data[flags]');
  expect(data.score, 'data[score]');
  expect(data.comments).to.be.a('array', 'data[comments]');
  expect(data.solutions).to.be.a('array', 'data[solutions]');
  expect(data.tags).to.be.a('array', 'data[tags]');
  expect(data.permalink).to.be.a('string', 'data[permalink]');
  expect(data.title).to.be.a('string', 'data[title]');
  expect(data.created_at).to.be.a('string', 'data[created_at]');
  expect(data.updated_at).to.be.a('string', 'data[updated_at]');
  expect(data.removed).to.be.a('boolean', 'data[removed]');
  expect(data.authorName).to.be.a('string', 'data[authorName]');
  expect(data.authorUrl).to.be.a('string', 'data[authorUrl]');
}
describe('POST /api/tutorial-requests', () => {
  it('create a new tutorial request', (done) => {
    request('localhost:3000')
      .post('/api/tutorial-requests')
      .send({version: '5', engine: 'unity', title: 'Hello world', content: 'test content'})
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).to.be.an('object');
        expectBaseProps(res.body);

        expect(res.body.content).to.equal('test content');
        expect(res.body.version).to.equal('5');
        expect(res.body.engine).to.equal('unity');

        expect(res.body.title).to.equal('Hello world');
        done();
      });
  });
});


describe('GET /api/tutorial-requests', () => {
  it('get list of tutorail request', (done) => {
    request('localhost:3000')
      .get('/api/tutorial-requests')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);
        expect(res.body).to.be.an('array');
        expectBaseProps(res.body[0]);
        done();
      });
  });
});

describe('GET /api/tutorial-requests/:id', () => {
  it('get single tutorial request by id', (done) => {
    request('localhost:3000')
      .get('/api/tutorial-requests/' + testid)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);
        expectBaseProps(res.body);
        done();
    });
  });
});



describe('PUT /api/tutorial-requests/:id', () => {
  it('update existing tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/' + testid)
      .send({content: 'omgzors the content is changed'})
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);
        expectBaseProps(res.body);
        expect(res.body.content).to.equal('omgzors the content is changed');
        done();
      });
  });
});

describe('PUT /api/tutorial-requests/:id/flag', () => {
  it('flags tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/' + testid + '/flag')
      .send({flagType: 'spam'})
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);
        expect(res.body.flagType, 'data[flagType]');
        expect(res.body.flagType).to.be.a('string');
        expect(res.body.isFlagged, 'data[isFlagged]');
        expect(res.body.isFlagged).to.be.a('boolean');
        done();
      });
  });
});
describe('PUT /api/tutorial-requests/:id/vote (direction: up)', () => {
  it('votes on tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/' + testid + '/vote')
      .send({direction: "up"})
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);
        expect(res.body.userVote, 'data[userVote]');
        expect(res.body.userVote).to.be.a('number', 'data[userVote]');
        done();
      });
  });
});

describe('PUT /api/tutorial-requests/:id/vote (direction: down)', () => {
  it('votes on tutorial request', (done) => {
    request('localhost:3000')
      .put('/api/tutorial-requests/' + testid + '/vote')
      .send({direction: "down"})
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) done(err);
        expect(res.body.userVote, 'data[userVote]');
        expect(res.body.userVote).to.be.a('number', 'data[userVote]');
        done();
      });
  });
});




describe('DELETE /api/tutorial-requests/:id', () => {
  it('deletes a tutorial request', (done) => {
    request('localhost:3000')
      .delete('/api/tutorial-requests/' + testid)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
