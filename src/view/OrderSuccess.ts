import { Component } from "../components/base/Component";

export class OrderSuccess extends Component<{}> {
  description: HTMLElement;
  totalElement: HTMLElement;
  buttonClose: HTMLButtonElement;
  private readonly onRequestClose?: () => void;

  constructor(container: HTMLElement, onRequestClose?: () => void) {
    super(container);
    this.onRequestClose = onRequestClose;

    this.description = this.container.querySelector(".order-success__description")!;
    this.totalElement =
      (this.container.querySelector(".order-success__total") as HTMLElement | null) ||
      this.description;

    this.buttonClose = this.container.querySelector(".order-success__close")!;

    this.buttonClose.addEventListener("click", () => {
      this.onRequestClose?.();
    });
  }

  setTotal(total: number) {
    this.totalElement.textContent = `Списано ${total} синапсов`;
  }

  render(): HTMLElement {
    return this.container;
  }
}