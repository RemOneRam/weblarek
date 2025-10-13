import { Component } from "../components/base/Component";

export class Modal extends Component<{}> {
  modalElement: HTMLElement;
  contentElement: HTMLElement;
  closeButton: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);
    this.modalElement = this.container;
    this.contentElement = this.modalElement.querySelector(".modal__content")!;
    this.closeButton = this.modalElement.querySelector(".modal__close")!;

    this.closeButton.addEventListener("click", () => this.close());
    this.modalElement.addEventListener("click", (e) => {
      if (e.target === this.modalElement) this.close();
    });
  }

  open(content: HTMLElement) {
    this.setContent(content);
    this.modalElement.classList.add("modal_active");
  }

  close() {
    this.modalElement.classList.remove("modal_active");
  }

  setContent(content: HTMLElement) {
    this.contentElement.innerHTML = "";
    this.contentElement.appendChild(content);
  }

  render(): HTMLElement {
    return this.container;
  }
}
