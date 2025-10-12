import { Component } from "../components/base/Component";

export class OrderSuccess extends Component<{}> {
  description: HTMLElement;
  totalElement: HTMLElement;
  buttonClose: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);
    this.description = this.container.querySelector('.order-success__description')!;
    // поправил селектор total (в шаблоне это order-success__description? скорее total отдельный элемент)
    this.totalElement = this.container.querySelector('.order-success__description')!;
    this.buttonClose = this.container.querySelector('.order-success__close')!;

    this.buttonClose.addEventListener('click', () => {
      this.container.remove();
    });
  }

  setTotal(total: number) {
    this.totalElement.textContent = `Списано ${total} синапсов`;
  }

  render(): HTMLElement {
    return this.container;
  }
}