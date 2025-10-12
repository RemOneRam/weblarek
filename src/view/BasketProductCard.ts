import { EventEmitter } from '../components/base/Events';
import { IProduct } from "../types";

export class BasketProductCard {
  private container: HTMLElement;
  private titleEl: HTMLElement | null;
  private priceEl: HTMLElement | null;
  private removeBtn: HTMLButtonElement | null;
  private events: EventEmitter;

  constructor(container: HTMLElement, events: EventEmitter) {
    this.container = container;
    this.events = events;

    // пытаемся найти title/price в нескольких вариантах
    this.titleEl = this.container.querySelector('.card__title') ?? this.container.querySelector('.basket__item-title');
    this.priceEl = this.container.querySelector('.card__price') ?? this.container.querySelector('.basket__item-price');
    this.removeBtn = this.container.querySelector('.basket__item-delete');

    this.removeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = this.container.dataset.productId;
      this.events.emit('cart:remove', { productId: pid });
    });
  }

  render(product: IProduct) {
    this.container.dataset.productId = product.id;
    if (this.titleEl) this.titleEl.textContent = product.title;
    if (this.priceEl) this.priceEl.textContent = product.price != null ? `${product.price} синапсов` : '—';
    return this.container;
  }
}