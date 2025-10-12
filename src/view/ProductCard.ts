import { EventEmitter } from '../components/base/Events';
import { IProduct } from "../types";

export class ProductCard {
  protected container: HTMLElement;
  protected title: HTMLElement | null;
  protected price: HTMLElement | null;
  protected image: HTMLImageElement | null;
  protected button: HTMLButtonElement | null;
  protected events: EventEmitter;

  constructor(container: HTMLElement, events: EventEmitter) {
    this.container = container;
    this.events = events;

    this.title = this.container.querySelector('.card__title');
    this.price = this.container.querySelector('.card__price');
    this.image = this.container.querySelector('.card__image');
    this.button = this.container.querySelector('button');

    // клик по карточке открывает превью (если клик не по кнопке)
    this.container.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      this.events.emit('product:select', { element: this.container });
    });

    // кнопка покупки/действия
    this.button?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.events.emit('product:buy', { element: this.container });
    });
  }

  render(product: IProduct): HTMLElement {
    this.container.dataset.productId = product.id;
    if (this.title) this.title.textContent = product.title;
    if (this.price) this.price.textContent = product.price != null ? `${product.price} синапсов` : '—';
    this.setImage(product.image || '', product.title || '');
    this.updateButtonState(product);
    return this.container;
  }

  protected setImage(src: string, alt?: string) {
    if (this.image) {
      this.image.src = src || '';
      this.image.alt = alt || '';
    }
  }

  protected updateButtonState(product: IProduct) {
    if (!this.button) return;
    if (product.price === null || product.price === undefined) {
      this.button.textContent = 'Недоступно';
      this.button.disabled = true;
    } else {
      this.button.textContent = 'Купить';
      this.button.disabled = false;
    }
  }
}