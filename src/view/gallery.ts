import { EventEmitter } from '../components/base/Events';

/**
 * Gallery view component
 * Отвечает за отображение списка карточек товаров
 */
export class Gallery {
  private container: HTMLElement;
  private catalogElement: HTMLElement | null;
  private emitter?: EventEmitter;

  constructor(container: HTMLElement, emitter?: EventEmitter) {
    this.container = container;
    this.emitter = emitter;

    this.catalogElement = this.container.querySelector('.gallery__list') as HTMLElement | null;
  }

  setCatalog(items: HTMLElement[]): void {
    if (!this.catalogElement) return;
    this.catalogElement.innerHTML = '';
    items.forEach(item => this.catalogElement!.appendChild(item));
  }

  render(): HTMLElement {
    return this.container;
  }
}