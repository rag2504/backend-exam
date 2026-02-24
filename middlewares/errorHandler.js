function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  if (err.name === 'CastError') {
    return res.status(404).json({ error: 'Not found' });
  }
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate field value' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
