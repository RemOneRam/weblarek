import { EventEmitter } from '../components/base/Events';

/**
 * Gallery view component
 * Отвечает за отображение списка карточек товаров.
 * Использует <main class="gallery"></main> в качестве контейнера.
 */
export class Gallery {
  private container: HTMLElement;
  private emitter?: EventEmitter;

  constructor(container: HTMLElement, emitter?: EventEmitter) {
    this.container = container;
    this.emitter = emitter;
  }

  /**
   * Устанавливает массив карточек для отображения.
   * Заменяет всё содержимое <main> на новые элементы.
   */
  setCatalog(items: HTMLElement[]): void {
    this.container.replaceChildren(...items);
  }

  /**
   * Возвращает корневой элемент галереи.
   */
  render(): HTMLElement {
    return this.container;
  }
}