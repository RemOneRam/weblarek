import { EventEmitter } from '../components/base/Events';
import { IProduct } from "../types";

export class BasketProductCard {
  private container: HTMLElement;
  private titleEl: HTMLElement | null;
  private priceEl: HTMLElement | null;
  private removeBtn: HTMLButtonElement | null;
  private events: EventEmitter;
  private formatPrice: (price: number | null | undefined) => string;

  constructor(container: HTMLElement, events: EventEmitter, formatPrice: (price: number | null | undefined) => string) {
    this.container = container;
    this.events = events;
    this.formatPrice = formatPrice;

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
    if (this.priceEl) {
      if (product.title === "Мамка-таймер") {
        this.priceEl.textContent = 'Бесценно';
      } else {
        this.priceEl.textContent = this.formatPrice(product.price);
      }
    }
    return this.container;
  }
}
