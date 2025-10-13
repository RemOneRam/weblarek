import { Component } from "../components/base/Component";
import { Modal } from "../view/Modal";

export class OrderSuccess extends Component<{}> {
  description: HTMLElement;
  totalElement: HTMLElement;
  buttonClose: HTMLButtonElement;
  modalInstance: Modal;

  constructor(container: HTMLElement) {
    super(container);
    this.description = this.container.querySelector(
      ".order-success__description"
    )!;
    this.totalElement = this.container.querySelector(
      ".order-success__description"
    )!;
    this.buttonClose = this.container.querySelector(".order-success__close")!;

    const modalContainer = document.getElementById("modal-container");
    this.modalInstance = new Modal(modalContainer!);

    this.buttonClose.addEventListener("click", () => {
      this.modalInstance.close();
    });
  }

  setTotal(total: number) {
    this.totalElement.textContent = `Списано ${total} синапсов`;
  }

  render(): HTMLElement {
    return this.container;
  }
}
