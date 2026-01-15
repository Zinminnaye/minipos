// db.js
import Dexie from 'dexie'

// Create the database
export const db  = new Dexie('posDB')

// Define database schema
db.version(1).stores({
  products: 'id, name, price, category, image',
  saleHeaders: '++id, date, total',  // auto-increment primary key
  saleItems: '++id, saleId, productId, quantity, price'
})

// Optional: Open database (Dexie does this automatically on first operation)
db.open().catch(err => {
  console.error('Failed to open db:', err)
})
