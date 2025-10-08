import { EventEmitter } from '../components/base/Events';

/**
 * Header view component
 * Находит элементы в конструкторе и эмитит события через EventEmitter
 */
export class Header {
  private container: HTMLElement;
  private basketButton: HTMLButtonElement | null;
  private counterElement: HTMLElement | null;
  private emitter?: EventEmitter;

  constructor(container: HTMLElement, emitter?: EventEmitter) {
    this.container = container;
    this.emitter = emitter;

    this.basketButton = this.container.querySelector('.header__basket') as HTMLButtonElement | null;
    this.counterElement = this.container.querySelector('.header__counter') as HTMLElement | null;

    if (this.basketButton) {
      this.basketButton.addEventListener('click', () => {
        this.emitter?.emit('modal:open', { modal: 'cart' });
      });
    }
  }

  setCounter(value: number): void {
    if (this.counterElement) {
      this.counterElement.textContent = String(value);
    }
  }

  render(): HTMLElement {
    return this.container;
  }
}