import { ProductCard } from "./ProductCard";
import { EventEmitter } from "../components/base/Events";
import { IProduct } from "../types";

export class CatalogProductCard extends ProductCard {
  private categoryEl: HTMLElement | null;
  private titleEl: HTMLElement | null;
  private priceEl: HTMLElement | null;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container, events);
    this.categoryEl = this.container.querySelector(".card__category");
    this.titleEl = this.container.querySelector(".card__title");
    this.priceEl = this.container.querySelector(".card__price");
  }

  render(product: IProduct): HTMLElement {
    super.render(product);

    if (this.titleEl) this.titleEl.textContent = product.title || '';
    if (this.categoryEl) {
      this.categoryEl.textContent = product.category || '';
      const color = super.getCategoryColors()[product.category || ''];
      if (color) (this.categoryEl as HTMLElement).style.backgroundColor = color;
    }
    if (this.priceEl) {
      this.priceEl.textContent = product.price != null ? this.formatPriceNumber(product.price) : "Бесценно";
    }
    return this.container;
  }
}
