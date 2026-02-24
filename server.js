const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);
const connectDB = require('./config/db');
const app = require('./app');
const User = require('./models/User');

async function bootstrapManager() {
  const existing = await User.findOne({ role: 'MANAGER' });
  if (existing) {
    console.log('MANAGER already exists');
    return;
  }
  await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'Admin@123',
    role: 'MANAGER'
  });
  console.log('Default MANAGER created');
}

async function start() {
  await connectDB();
  await bootstrapManager();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/docs`);
  });
}

start();
