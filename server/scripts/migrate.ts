import Database from 'better-sqlite3'
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'
const databaseUrl = process.env.DATABASE_URL!

async function runMigrations() {
  console.log('Running database migrations...')
  
  const schemaPath = path.join(__dirname, '../database/schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  
  if (isDevelopment || databaseUrl.includes('sqlite')) {
    // SQLite (development)
    const db = new Database(databaseUrl.replace('sqlite:', ''))
    db.exec(schema)
    db.close()
    console.log('SQLite database migrated successfully')
  } else {
    // PostgreSQL (production)
    const client = new Client({ connectionString: databaseUrl })
    await client.connect()
    
    // Convert SQLite schema to PostgreSQL
    const pgSchema = convertSqliteToPostgreSQL(schema)
    await client.query(pgSchema)
    
    await client.end()
    console.log('PostgreSQL database migrated successfully')
  }
}

function convertSqliteToPostgreSQL(sqliteSchema: string): string {
  return sqliteSchema
    .replace(/TEXT PRIMARY KEY/g, 'TEXT PRIMARY KEY')
    .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    .replace(/BOOLEAN DEFAULT 1/g, 'BOOLEAN DEFAULT true')
    .replace(/BOOLEAN DEFAULT 0/g, 'BOOLEAN DEFAULT false')
}

if (require.main === module) {
  runMigrations().catch(console.error)
}

export { runMigrations }