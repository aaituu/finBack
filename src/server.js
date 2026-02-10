// Balgyn: Server entry (DB connect + listen)

const { connectDB } = require('./config/db');
const { env } = require('./config/env');
const { app } = require('./app');
const { ensureAdminUser } = require('./utils/ensureAdminUser');

async function start() {
  await connectDB();
  await ensureAdminUser();

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
