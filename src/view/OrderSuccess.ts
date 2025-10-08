import { EventEmitter } from '../components/base/Events';

/**
 * OrderSuccess - компонент для отображения сообщения об успешном заказе.
 */
export class OrderSuccess {
  private container: HTMLElement;
  private description: HTMLElement | null;
  private totalElement: HTMLElement | null;
  private buttonClose: HTMLButtonElement | null;
  private emitter?: EventEmitter;

  constructor(container: HTMLElement, emitter?: EventEmitter) {
    this.container = container;
    this.emitter = emitter;

    this.description = this.container.querySelector('.order-success__desc') as HTMLElement | null;
    this.totalElement = this.container.querySelector('.order-success__total') as HTMLElement | null;
    this.buttonClose = this.container.querySelector('.order-success__close') as HTMLButtonElement | null;

    if (this.buttonClose) {
      this.buttonClose.addEventListener('click', () => {
        this.emitter?.emit('modal:close', {});
      });
    }
  }

  setTotal(total: number): void {
    if (this.totalElement) this.totalElement.textContent = String(total);
  }

  render(): HTMLElement {
    return this.container;
  }
}