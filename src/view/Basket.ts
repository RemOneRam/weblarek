import { Component } from "../components/base/Component";
import { EventEmitter } from '../components/base/Events';

export class Basket extends Component<{}> {
  listElement: HTMLElement;
  totalElement: HTMLElement;
  buttonOrder: HTMLButtonElement;
<<<<<<< HEAD
  private readonly emptyMessage: HTMLDivElement;
  private events: EventEmitter;
=======
  private emptyMessage: HTMLDivElement;
>>>>>>> 403bf1e5dd40ef43d6ef3877c677e69516cf2d22

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this.events = events;
    this.listElement = this.container.querySelector(".basket__list")!;
    this.totalElement = this.container.querySelector(".basket__price")!;
    this.buttonOrder = this.container.querySelector(".basket__button")!;
    this.emptyMessage = document.createElement('div');
    this.emptyMessage.className = 'basket__empty-message modal__title';
    this.emptyMessage.textContent = 'Корзина пуста';
    this.emptyMessage.style.opacity = "30%";
<<<<<<< HEAD

    this.buttonOrder.addEventListener('click', () => {
      this.events.emit('basket:order', {});
    });
=======
>>>>>>> 403bf1e5dd40ef43d6ef3877c677e69516cf2d22
  }

  setItems(items: HTMLElement[]) {
    this.listElement.innerHTML = "";
    if (!items.length) {
      if (!this.emptyMessage.isConnected) {
        this.listElement.append(this.emptyMessage);
      }
      return;
    }
    if (this.emptyMessage.isConnected) this.emptyMessage.remove();
    items.forEach((item) => this.listElement.appendChild(item));
  }

  setTotal(total: number) {
    this.totalElement.textContent = `${total} синапсов`;
  }

  setButtonState(active: boolean) {
    this.buttonOrder.disabled = !active;
  }

  render(): HTMLElement {
    return this.container;
  }
}
