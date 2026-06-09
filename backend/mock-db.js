// Task, Create a CRUD application to simulate api behaviour/functions
// make use of list function, promise, async-await
let products = [
    { id: 101, name: "Laptiop", price: 50000 },
    { id: 102, name: "Mobile", price: 20000 },
    { id: 103, name: "Tablet", price: 30000 },
    { id: 104, name: "Monitor", price: 15000 }
]
// your application should be 6 functions to perform CRUD operations using Promise
// 1. createProduct 
// -- takes product object as argument and add to products array
// -- check if id is present, if yes, reject with error
// -- if name is missing, replace with "Unknown Product" 
// -- if price is missing, replace with 0
// 2. getProducts, 
// -- returns all products after 2 seconds delay using Promise
// 3. getProductById, 
// -- takes id as argument and returns product with that id after 1 second delay 
// using Promise, if not found, reject with error
// 4. searchProduct,
// -- takes name as argument and returns all products that match the name
// 5. updateProduct, 
// -- takes id and update object as arguments, 
// finds product by id and updates it with the update object, 
// if not found, reject with error
// 6. deleteProduct
// -- takes id as argument and deletes product with that id,
// if not found, reject with error, if deleted, resolve with success message


// run this application using, 
// npm run start-mock-db


// Example:
const getProductById = (id) => new Promise(
    (resolve, reject)=> {
        setTimeout(() => {
            const product = products.find(p => p.id === id);
            if (product) {
                resolve(product);
            } else {
                reject(new Error("Product not found"));
            }
        }, 1000);
    }
)
const createProduct = (product) => new Promise(
    (resolve, reject) => {
        if(!product.id){
            reject(new Error("Id is required"))
        }
        product.name = product.name ?? "Unknown"
        product.price = product.price ?? 0

        products.push(product)
        resolve("Created")
    }
)
const updateProduct = (id, product) => new Promise(
    (resolve, reject) => {
        const exists = product.find(p => p.id === id)
        if(!exists) reject(new Error("Doesnot exists"))
        exists = { ...exists, ...product}
        resolve(exists)
    }
)
