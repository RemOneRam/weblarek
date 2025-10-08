import { ProductCard } from './ProductCard';
import { EventEmitter } from '../components/base/Events';

/**
 * Карточка товара в корзине
 * Содержит кнопку удаления товара
 */
export class BasketProductCard extends ProductCard {
  private removeButton: HTMLButtonElement | null;

  constructor(container: HTMLElement, emitter?: EventEmitter) {
    super(container, emitter);

    this.removeButton = this.container.querySelector('.card__remove') as HTMLButtonElement | null;
    if (this.removeButton) {
      this.removeButton.addEventListener('click', (evt) => {
        evt.stopPropagation();
        this.emitter?.emit('cart:remove', { element: this.container });
      });
    }
  }

  render(): HTMLElement {
    return this.container;
  }
}