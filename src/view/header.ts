import { EventEmitter } from "../components/base/Events";
import { Component } from "../components/base/Component";

interface HeaderData {
  cartCount: number;
}

export class Header extends Component<HeaderData> {
  basketButton: HTMLButtonElement;
  counterElement: HTMLElement;

  private emitter: EventEmitter;

  constructor(container: HTMLElement, emitter: EventEmitter) {
    super(container);
    this.emitter = emitter;

    this.basketButton = this.container.querySelector(".header__basket")!;
    this.counterElement = this.container.querySelector(
      ".header__basket-counter"
    )!;

    this.basketButton.addEventListener("click", () => {
      this.emitter.emit("modal:open", { modal: "cart" });
    });
  }

  setCounter(value: number) {
    this.counterElement.textContent = String(value);
  }

  render(data: HeaderData): HTMLElement {
    this.setCounter(data.cartCount);
    return this.container;
  }
}
