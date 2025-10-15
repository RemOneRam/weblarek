import { EventEmitter } from "../components/base/Events";
import { IProduct } from "../types";

export class BasketProductCard {
  private container: HTMLElement;
  private titleEl: HTMLElement | null;
  private priceEl: HTMLElement | null;
  private removeBtn: HTMLButtonElement | null;
  private indexEl: HTMLElement | null; // добавили для порядкового номера
  private events: EventEmitter;

  constructor(
    container: HTMLElement,
    events: EventEmitter,
  ) {
    this.container = container;
    this.events = events;

    this.titleEl =
      this.container.querySelector(".card__title") ??
      this.container.querySelector(".basket__item-title");
    this.priceEl =
      this.container.querySelector(".card__price") ??
      this.container.querySelector(".basket__item-price");
    this.indexEl = this.container.querySelector(".basket__item-index"); // добавлено
    this.removeBtn = this.container.querySelector(".basket__item-delete");

    this.removeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const pid = this.container.dataset.productId;
      this.events.emit("cart:remove", { productId: pid });
    });
  }

  render(product: IProduct, index?: number) {
    this.container.dataset.productId = product.id;
    if (this.titleEl) this.titleEl.textContent = product.title;

    // отображаем индекс, если передан
    if (this.indexEl && index !== undefined) {
      this.indexEl.textContent = `${index}`;
    }

    if (this.priceEl) {
      this.priceEl.textContent = product.price != null ? this.formatPriceNumber(product.price) : "Бесценно";
    }

    return this.container;
  }

  protected formatPriceNumber(n: number): string {
    return (n >= 10000
        ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
        : String(n)
    ) + " синапсов";
  }
}
