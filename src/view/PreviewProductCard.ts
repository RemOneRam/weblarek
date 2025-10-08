import { ProductCard } from './ProductCard';
import { EventEmitter } from '../components/base/Events';

/**
 * Карточка товара для превью/модалки
 * Содержит кнопку добавления в корзину
 */
export class PreviewProductCard extends ProductCard {
  private addButton: HTMLButtonElement | null;

  constructor(container: HTMLElement, emitter?: EventEmitter) {
    super(container, emitter);

    this.addButton = this.container.querySelector('.card__add') as HTMLButtonElement | null;
    if (this.addButton) {
      this.addButton.addEventListener('click', (evt) => {
        evt.stopPropagation();
        this.emitter?.emit('product:buy', { element: this.container });
      });
    }
  }

  render(): HTMLElement {
    return this.container;
  }
}