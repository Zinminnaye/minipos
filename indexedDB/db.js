// db.js
import Dexie from 'dexie'

// Create the database
export const db  = new Dexie('posDB')

// Define database schema
db.version(1).stores({
  products: 'id, stock_no,stock_name, price,promotion_price,category_no,group_no,class_no,um_no,expire,batch_no, expire_date,balance, image',
  saleHeaders: '++id, invoice_no, invoice_date,amount',  // auto-increment primary key
  saleItems: '++id, sale_id, stock_id, quantity, price'
})


// Optional: Open database (Dexie does this automatically on first operation)
db.open().catch(err => {
  console.error('Failed to open db:', err)
})
