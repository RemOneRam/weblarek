import { ProductCard } from './ProductCard';
import { EventEmitter } from '../components/base/Events';

/**
 * Карточка товара в каталоге
 * Наследует общий функционал из ProductCard
 */
export class CatalogProductCard extends ProductCard {
  constructor(container: HTMLElement, emitter?: EventEmitter) {
    super(container, emitter);

    if (this.buttonEl) {
      this.buttonEl.addEventListener('click', (evt) => {
        evt.stopPropagation();
        this.emitter?.emit('product:buy', { element: this.container });
      });
    }
  }

  render(): HTMLElement {
    return this.container;
  }
}