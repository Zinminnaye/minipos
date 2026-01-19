// saleService.js
import { db } from '../indexedDB/db.js'

// Global arrays (optional)
export let saleHeaders = []
export let saleItems = []

// Save a sale header and its items
export async function saveSale(header, items) {
  try {
    // Save header first
    const headerId = await db.saleHeaders.add(header)

    // Add saleId to each item
    const itemsWithSaleId = items.map(i => ({ ...i, sale_id: headerId }))

    // Save items
    await db.saleItems.bulkPut(itemsWithSaleId)

    console.log('Sale saved:', { headerId, items: itemsWithSaleId })

    // Update global arrays
    saleHeaders.push({ ...header, id: headerId })
    saleItems.push(...itemsWithSaleId)

    return headerId
  } catch (err) {
    console.error('Failed to save sale:', err)
  }
}

// Get all sale headers
export async function getSaleHeaders() {
  try {
    saleHeaders = await db.saleHeaders.toArray()
    return saleHeaders
  } catch (err) {
    console.error('Failed to load sale headers:', err)
    return []
  }
}

// Get all items for a sale
export async function getSaleItems(saleId) {
  try {
    const items = await db.saleItems.where('saleId').equals(saleId).toArray()
    return items
  } catch (err) {
    console.error('Failed to load sale items:', err)
    return []
  }
}
