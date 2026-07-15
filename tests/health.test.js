const request = require('supertest');
const express = require('express');

const app = express();
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusTrace API is running 🎒' });
});

describe('Health Check API', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });
});
