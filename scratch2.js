const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Dx_xD_2016%231@db.qqdgskanxkxiwogekhuf.supabase.co:5432/postgres?sslmode=require'
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Success:', res.rows);
  }
  pool.end();
});
