import { EventEmitter } from "../components/base/Events";
import { IProduct } from "../types";
import { CDN_URL } from '../utils/constants.ts';


export function formatPriceView(value: number): string {
  const formatted = value >= 10000
    ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    : String(value);
  return `${formatted} синапсов`;
}

const CATEGORY_COLORS: Record<string, string> = {
  'софт-скил': '#83FA9D',
  'другое': '#FAD883',
  'кнопка': '#83DDFA',
  'дополнительное': '#B783FA',
  'хард-скил': '#FAA083',
};

function resolveImageUrl(img?: string): string {
  if (!img) return './src/images/Subtract.svg';
  const fixed = img.endsWith('.svg') ? img.replace('.svg', '.png') : img;
  return `${CDN_URL}/${fixed}`;
}

export class ProductCard {
  protected container: HTMLElement;
  protected title: HTMLElement | null;
  protected price: HTMLElement | null;
  protected image: HTMLImageElement | null;
  protected button: HTMLButtonElement | null;
  protected events: EventEmitter;
  private readonly CATEGORY_COLORS: Record<string, string>;
  protected currentProduct?: IProduct;

  constructor(container: HTMLElement, events: EventEmitter) {
    this.container = container;
    this.events = events;

    this.title = this.container.querySelector(".card__title");
    this.price = this.container.querySelector(".card__price");
    this.image = this.container.querySelector(".card__image");
    this.button = this.container.querySelector(".card__button");

    this.CATEGORY_COLORS = CATEGORY_COLORS;

    this.container.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest(".card__button")) return;
      this.events.emit("product:select", { element: this.container });
    });

    this.button?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.events.emit("product:buy", { element: this.container });
    });
  }

  render(product: IProduct): HTMLElement {
    this.container.dataset.productId = String(product.id);
    this.currentProduct = product;

    if (this.title) this.title.textContent = product.title;
    if (this.price) {
      this.price.textContent = product.price != null ? formatPriceView(product.price) : "—";
    }
    this.setImage(product.image || "", product.title || "");
    this.updateButtonState(product);
    return this.container;
  }

  protected setImage(src: string, alt?: string) {
    if (this.image) {
      this.image.src = resolveImageUrl(src);
      this.image.alt = alt || "";
    }
  }

  protected updateButtonState(product: IProduct) {
    if (!this.button) return;
    if (product.price === null || product.price === undefined) {
      this.button.textContent = "Недоступно";
      this.button.disabled = true;
    } else {
      this.button.textContent = "Купить";
      this.button.disabled = false;
    }
  }

  getCategoryColors() {
    return this.CATEGORY_COLORS;
  }

  public setInCart(inCart: boolean) {
    if (!this.button) return;
    if (this.currentProduct?.price == null) return;
    this.button.textContent = inCart ? "Удалить из корзины" : "Купить";
  }
}
