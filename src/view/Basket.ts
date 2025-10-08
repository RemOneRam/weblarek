import { EventEmitter } from '../components/base/Events';

/**
 * Basket view component
 * Отвечает за отображение списка товаров и общей суммы
 */
export class Basket {
  private container: HTMLElement;
  private listElement: HTMLElement | null;
  private totalElement: HTMLElement | null;
  private buttonOrder: HTMLButtonElement | null;
  private emitter?: EventEmitter;

  constructor(container: HTMLElement, emitter?: EventEmitter) {
    this.container = container;
    this.emitter = emitter;

    this.listElement = this.container.querySelector('.basket__list') as HTMLElement | null;
    this.totalElement = this.container.querySelector('.basket__total') as HTMLElement | null;
    this.buttonOrder = this.container.querySelector('.basket__order') as HTMLButtonElement | null;

    if (this.buttonOrder) {
      this.buttonOrder.addEventListener('click', () => {
        this.emitter?.emit('modal:open', { modal: 'checkout' });
      });
    }
  }

  setItems(items: HTMLElement[]): void {
    if (!this.listElement) return;
    this.listElement.innerHTML = '';
    items.forEach(i => this.listElement!.appendChild(i));
  }

  setTotal(total: number): void {
    if (this.totalElement) this.totalElement.textContent = String(total);
  }

  setButtonState(active: boolean): void {
    if (!this.buttonOrder) return;
    this.buttonOrder.disabled = !active;
  }

  render(): HTMLElement {
    return this.container;
  }
}