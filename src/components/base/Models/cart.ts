import { IProduct } from '../../../types';
import { EventEmitter } from '../../base/Events';

export class Cart {
    private items: IProduct[] = [];
    private emitter?: EventEmitter;

    constructor(emitter?: EventEmitter) {
        this.emitter = emitter;
    }

    getItems(): IProduct[] {
        return this.items;
    }

    addItem(product: IProduct): void {
        this.items.push(product);
        this.emitter?.emit('cart:changed', { items: this.items });
    }

    removeItem(productId: string): void {
        this.items = this.items.filter(item => item.id !== productId);
        this.emitter?.emit('cart:changed', { items: this.items });
    }

    clear(): void {
        this.items = [];
        this.emitter?.emit('cart:cleared', {});
    }

    getTotalPrice(): number {
        return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
    }

    getCount(): number {
        return this.items.length;
    }

    hasItem(productId: string): boolean {
        return this.items.some(item => item.id === productId);
    }
}