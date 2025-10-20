export interface Product {
    id: string,
    name: string,
    description: string,
    price: number,
    image: string[],
    category: string,
    subCategory: string,
    sizes: string[],
    date: number | string,
    bestseller?: boolean,
    newproduct?: boolean
}   