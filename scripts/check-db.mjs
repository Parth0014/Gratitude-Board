import assert from 'node:assert/strict';
import pg from 'pg';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
});
await client.connect();
try {
  await client.query('BEGIN');
  const user = await client.query(
    'INSERT INTO users(cognito_sub) VALUES (gen_random_uuid()::text) RETURNING id',
  );
  const board = await client.query(
    "INSERT INTO boards(owner_id, title, entry_mode) VALUES ($1, 'Test board', 'visual') RETURNING id, visibility, current_version",
    [user.rows[0].id],
  );
  assert.equal(board.rows[0].visibility, 'private');
  assert.equal(board.rows[0].current_version, 0);
  await client.query('SAVEPOINT invalid_status');
  await assert.rejects(
    client.query(
      "INSERT INTO vision_items(board_id, title, status) VALUES ($1, 'Test item', 'private')",
      [board.rows[0].id],
    ),
    { code: '23514' },
  );
  await client.query('ROLLBACK TO SAVEPOINT invalid_status');
  await client.query('SAVEPOINT invalid_member');
  await assert.rejects(
    client.query(
      "INSERT INTO board_members(board_id, user_id, role) VALUES ($1, $2, 'owner')",
      [board.rows[0].id, user.rows[0].id],
    ),
    { code: '23514' },
  );
  await client.query('ROLLBACK TO SAVEPOINT invalid_member');
  console.log(
    'Database constraints and private defaults verified. Test data rolled back.',
  );
} finally {
  await client.query('ROLLBACK');
  await client.end();
}
