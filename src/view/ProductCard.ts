import { categoryMap } from '../utils/constants';
import { EventEmitter } from '../components/base/Events';

/**
 * ProductCard - базовый класс карточки товара.
 * Сохраняет ссылки на элементы разметки и реализует общие методы отображения.
 */
export class ProductCard {
  protected container: HTMLElement;
  protected titleEl: HTMLElement | null;
  protected priceEl: HTMLElement | null;
  protected imageEl: HTMLImageElement | null;
  protected categoryEl: HTMLElement | null;
  protected buttonEl: HTMLButtonElement | null;
  protected emitter?: EventEmitter;

  constructor(container: HTMLElement, emitter?: EventEmitter) {
    this.container = container;
    this.emitter = emitter;

    this.titleEl = this.container.querySelector('.card__title');
    this.priceEl = this.container.querySelector('.card__price');
    this.imageEl = this.container.querySelector('.card__image') as HTMLImageElement | null;
    this.categoryEl = this.container.querySelector('.card__category');
    this.buttonEl = this.container.querySelector('.card__button') as HTMLButtonElement | null;

    if (this.container) {
      this.container.addEventListener('click', (evt) => {
        const target = evt.target as HTMLElement;
        // если клик по кнопке действия — дочерние классы будут обрабатывать
        if (this.buttonEl && this.buttonEl.contains(target)) return;
        // уведомляем о выборе товара
        this.emitter?.emit('product:select', { element: this.container });
      });
    }
  }

  setTitle(value: string): void {
    if (this.titleEl) this.titleEl.textContent = value;
  }

  setPrice(value: number | null): void {
    if (!this.priceEl) return;
    this.priceEl.textContent = value === null ? 'Бесценно' : String(value);
  }

  setImage(src: string, alt?: string): void {
    if (!this.imageEl) return;
    this.imageEl.src = src;
    if (alt !== undefined) this.imageEl.alt = alt;
  }

  setCategory(value: string): void {
    if (!this.categoryEl) return;
    this.categoryEl.textContent = value;

    // Удаляем предыдущие модификаторы категории (card__category_*)
    Array.from(this.categoryEl.classList).forEach(c => {
      if (c.startsWith('card__category_')) this.categoryEl!.classList.remove(c);
    });

    const mod = categoryMap && value in categoryMap
      ? categoryMap[value as keyof typeof categoryMap]
      : null;

    if (mod) {
      this.categoryEl.classList.add(`card__category_${mod}`);
    }
  }

  setButtonLabel(label: string): void {
    if (this.buttonEl) this.buttonEl.textContent = label;
  }

  render(): HTMLElement {
    return this.container;
  }
}