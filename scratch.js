const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.qqdgskanxkxiwogekhuf:Dx_xD_2016%231@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Success:', res.rows);
  }
  pool.end();
});
