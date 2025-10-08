import { IProduct } from '../../../types';
import { EventEmitter } from '../../base/Events';

export class Catalog {
    private products: IProduct[] = [];
    private selectedProduct: IProduct | null = null;
    private emitter?: EventEmitter;

    constructor(emitter?: EventEmitter) {
        this.emitter = emitter;
    }

    setProducts(products: IProduct[]): void {
        this.products = products;
        this.emitter?.emit('catalog:changed', { products });
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    getProductById(id: string): IProduct | undefined {
        return this.products.find(product => product.id === id);
    }

    setSelectedProduct(product: IProduct): void {
        this.selectedProduct = product;
        this.emitter?.emit('catalog:selected', { product });
    }

    getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}
