import { ProductCard } from './ProductCard';
import { EventEmitter } from '../components/base/Events';
import { IProduct } from "../types";

export class CatalogProductCard extends ProductCard {
  private categoryEl: HTMLElement | null;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container, events);
    this.categoryEl = this.container.querySelector('.card__category');
  }

  render(product: IProduct): HTMLElement {
    super.render(product);

    if (this.categoryEl) {
      this.categoryEl.textContent = product.category || '';
    }

    return this.container;
  }
}