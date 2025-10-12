import { ProductCard } from './ProductCard';
import { EventEmitter } from '../components/base/Events';
import { IProduct } from "../types";

export class PreviewProductCard extends ProductCard {
  private descriptionEl: HTMLElement | null;
  private categoryEl: HTMLElement | null;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container, events);
    this.descriptionEl = this.container.querySelector('.card__text') ?? this.container.querySelector('.card__description');
    this.categoryEl = this.container.querySelector('.card__category');
  }

  render(product: IProduct): HTMLElement {
    super.render(product);

    if (this.descriptionEl) this.descriptionEl.textContent = product.description || '';
    if (this.categoryEl) this.categoryEl.textContent = product.category || '';

    const btn = this.button;
    if (btn) {
      if (product.price == null) {
        btn.disabled = true;
        btn.textContent = 'Недоступно';
      } else {
        btn.disabled = false;
        btn.textContent = 'В корзину';
      }
    }

    return this.container;
  }
}