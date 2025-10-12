import { Component } from "../components/base/Component";

export class Basket extends Component<{}> {
  listElement: HTMLElement;
  totalElement: HTMLElement;
  buttonOrder: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);
    this.listElement = this.container.querySelector('.basket__list')!;
    this.totalElement = this.container.querySelector('.basket__price')!;
    this.buttonOrder = this.container.querySelector('.basket__button')!;
  }

  setItems(items: HTMLElement[]) {
    this.listElement.innerHTML = '';
    items.forEach(item => this.listElement.appendChild(item));
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