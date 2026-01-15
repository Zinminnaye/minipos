// productService.js
import { db  } from '../indexedDB/db.js'

// products array
 let products = []

// Save an array of products to IndexedDB
export async function saveProducts(productArray) {
  try {
    await db.products.bulkPut(productArray)
    console.log('Products saved to IndexedDB:', productArray)
  } catch (err) {
    console.error('Failed to save products:', err)
  }
}

// Load products from IndexedDB
export async function getProductsFromDB() {
  try {
    const allProducts = await db.products.toArray()
    products = allProducts // assign to global variable
    console.log('Products loaded from IndexedDB:', allProducts)
    return allProducts
  } catch (err) {
    console.error('Failed to load products from DB:', err)
    return []
  }
}

// Sync from server (if online)
export async function syncProductsFromServer() {
//   if (!navigator.onLine) return products

//   try {
//     const res = await fetch('/api/products')
//     const serverProducts = await res.json()
//     await saveProducts(serverProducts)
//     products = serverProducts
//     console.log('Products synced from server:', serverProducts)
//     return serverProducts
//   } catch (err) {
//     console.warn('Server fetch failed, using offline products')
//     return products
//   }
products = [
  {
    id: 'coca-cola',
    name: 'Coca Cola 330ml',
    price: 4400,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'lays-chips',
    name: "Lay's Chips Original",
    price: 2250,
    category: 'snacks',
    image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'kitkat',
    name: 'KitKat Chocolate',
    price: 1750,
    category: 'sweets',
    image: 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'mineral-water',
    name: 'Mineral Water 500ml',
    price: 750,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1346086/pexels-photo-1346086.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'pringles',
    name: 'Pringles Original',
    price: 3500,
    category: 'snacks',
    image: 'https://images.pexels.com/photos/4109998/pexels-photo-4109998.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'red-bull',
    name: 'Red Bull 250ml',
    price: 2500,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/2351838/pexels-photo-2351838.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'doritos',
    name: 'Doritos Nacho Cheese',
    price: 2750,
    category: 'snacks',
    image: 'https://images.pexels.com/photos/2762256/pexels-photo-2762256.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'snickers',
    name: 'Snickers Bar',
    price: 1250,
    category: 'sweets',
    image: 'https://images.pexels.com/photos/5705480/pexels-photo-5705480.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];
await saveProducts(products)
  return products
}
