import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function cleanupProductionData() {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    console.error('[CLEANUP ERROR] DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  console.log('[CLEANUP] Connecting to PostgreSQL database...');
  const pool = new Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Delete seed ledger entries and any fake capture IDs
    const ledgerRes = await client.query(`
      DELETE FROM ledger_entries 
      WHERE paypal_reference_id LIKE 'CAP_%'
         OR paypal_reference_id LIKE 'SIM_%'
         OR paypal_transaction_id IN (
           SELECT id FROM paypal_transactions 
           WHERE id IN ('tx_sarah_01', 'tx_david_02', 'tx_emma_03')
              OR paypal_capture_id LIKE 'CAP_%'
              OR paypal_capture_id LIKE 'SIM_%'
         );
    `);
    console.log(`[CLEANUP] Deleted ${ledgerRes.rowCount} demo / fake-capture ledger entries.`);

    // 2. Delete seed transactions and any transactions with simulated capture IDs
    const txRes = await client.query(`
      DELETE FROM paypal_transactions 
      WHERE id IN ('tx_sarah_01', 'tx_david_02', 'tx_emma_03')
         OR paypal_capture_id LIKE 'CAP_%'
         OR paypal_capture_id LIKE 'SIM_%'
         OR customer_name IN ('Sarah Jenkins', 'David Miller', 'Emma Watson');
    `);
    console.log(`[CLEANUP] Deleted ${txRes.rowCount} demo / fake-capture transaction rows.`);

    // 3. Delete demo staged confirmations
    const stagedRes = await client.query(`
      DELETE FROM staged_confirmations
      WHERE id LIKE 'stg_demo_%'
         OR customer_name IN ('Sarah Jenkins', 'David Miller', 'Emma Watson');
    `);
    console.log(`[CLEANUP] Deleted ${stagedRes.rowCount} demo staged confirmation records.`);

    await client.query('COMMIT');
    console.log('[CLEANUP SUCCESS] Production database successfully cleaned. Ledger now strictly contains authentic orders.');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[CLEANUP ERROR] Transaction rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupProductionData();
