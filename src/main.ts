import "./scss/styles.scss";

import { Catalog } from "./components/base/Models/catalog";
import { Cart } from "./components/base/Models/cart";
import { Buyer } from "./components/base/Models/buyer";

import { Api } from "./components/base/Api";
import { ApiService } from "./components/ApiService";
import { API_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/Events";

import { Header } from "./view/header";
import { Gallery } from "./view/gallery";
import { Modal } from "./view/Modal";
import { BasketProductCard } from "./view/BasketProductCard";
import { Basket } from "./view/Basket";
import { OrderSuccess } from "./view/OrderSuccess";
import { CatalogProductCard } from "./view/CatalogProductCard";
import { PreviewProductCard } from "./view/PreviewProductCard";
import { PaymentForm } from "./view/PaymentForm";
import { ContactForm } from "./view/ContactForm";
import { IProduct } from './types';

const productsById = new Map<string, any>();

let paymentChangeHandler:
  | ((payload: { payment: string | null; address: string }) => void)
  | null = null;
let orderStep1SubmitHandler:
  | ((payload: { data: { payment: string | null; address: string } }) => void)
  | null = null;

let contactChangeHandler:
  | ((payload: { data: { email: string; phone: string } }) => void)
  | null = null;
let orderSubmitHandler:
  | ((payload: { data: { email: string; phone: string } }) => void)
  | null = null;

const events = new EventEmitter();

const catalog = new Catalog(events);
const cart = new Cart(events);
const buyer = new Buyer(events);

const api = new Api(API_URL);
const apiService = new ApiService(api);

const headerContainer = document.querySelector(
  ".header__container"
) as HTMLElement | null;
if (!headerContainer) throw new Error("Элемент .header__container не найден");

const galleryContainer = document.querySelector(
  ".gallery"
) as HTMLElement | null;
if (!galleryContainer) throw new Error("Элемент .gallery не найден");

const modalElement = document.getElementById(
  "modal-container"
) as HTMLElement | null;
if (!modalElement) throw new Error("Элемент #modal-container не найден");

const header = new Header(headerContainer, events);
const gallery = new Gallery(galleryContainer);
const modal = new Modal(modalElement);

const tmplCardCatalog = document.getElementById(
  "card-catalog"
) as HTMLTemplateElement;
const tmplCardPreview = document.getElementById(
  "card-preview"
) as HTMLTemplateElement;
const tmplCardBasket = document.getElementById(
  "card-basket"
) as HTMLTemplateElement;
const tmplBasket = document.getElementById("basket") as HTMLTemplateElement;
const tmplOrder = document.getElementById("order") as HTMLTemplateElement;
const tmplContacts = document.getElementById("contacts") as HTMLTemplateElement;
const tmplSuccess = document.getElementById("success") as HTMLTemplateElement;

const cloneTemplate = (t: HTMLTemplateElement): HTMLElement =>
  t.content.firstElementChild!.cloneNode(true) as HTMLElement;

function toggleCartItem(product: any) {
  if (cart.hasItem(product.id)) cart.removeItem(product.id);
  else cart.addItem(product);

  events.emit("cart:updated", { items: cart.getItems() });
}

function createCatalogCard(product: any): HTMLElement {
  const view = new CatalogProductCard(cloneTemplate(tmplCardCatalog), events);
  return view.render(product);
}

function createPreviewCard(product: any): HTMLElement {
  const view = new PreviewProductCard(cloneTemplate(tmplCardPreview), events);
  return view.render(product);
}

events.on<{ productId: string }>("cart:remove", ({ productId }) => {
  cart.removeItem(productId);
  events.emit("cart:updated", { items: cart.getItems() });
});
events.on<{ items: any[] }>("cart:updated", ({ items }) => {
  header.setCounter(items.length);

  if (modalElement.querySelector(".basket")) {
    modal.open(buildBasketNode(items));
  }
});
events.on<{ modal: string }>("modal:open", ({ modal: modalName }) => {
  if (modalName === "cart") {
    modal.open(buildBasketNode(cart.getItems()));
  }
});

events.on<{ element: HTMLElement }>("product:select", ({ element }) => {
  const id = element.dataset.productId as string;
  const product = productsById.get(id);
  if (product) openProductPreview(product);
});
events.on<{ element: HTMLElement }>("product:buy", ({ element }) => {
  const id = element.dataset.productId as string;
  const product = productsById.get(id);
  if (!product) return;
  toggleCartItem(product);
  if (element.closest('#modal-container')) {
    modal.close();
  }
});

function buildBasketNode(items: any[]): HTMLElement {
  const node = cloneTemplate(tmplBasket);
  const basketView = new Basket(node);

  const itemNodes = items.map((p, i) =>
    new BasketProductCard(
      cloneTemplate(tmplCardBasket),
      events,
    ).render(p, i + 1)
  );
  basketView.setItems(itemNodes);

  const total = items.reduce((sum, it) => sum + (it.price ?? 0), 0);
  basketView.setTotal(total);
  basketView.setButtonState(items.length > 0);

  const orderBtn = node.querySelector(".basket__button") as HTMLButtonElement;
  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      if (items.length > 0) {
        openOrderForm();
      }
    });
  }

  return node;
}

function openProductPreview(product: any) {
  const view = new PreviewProductCard(cloneTemplate(tmplCardPreview), events);
  const node = view.render(product);
  view.setInCart(cart.hasItem(product.id));
  modal.open(node);
}

function openOrderForm(): void {
  const orderNode = cloneTemplate(tmplOrder) as HTMLFormElement;
  const paymentForm = new PaymentForm(orderNode, events);
  modal.open(orderNode);

  const validate = (data: { payment: string | null; address: string }) => {
    const errors: string[] = [];
    if (!data.payment) errors.push('Выберите способ оплаты');
    if (!data.address?.trim()) errors.push('Необходимо указать адрес');
    paymentForm.setErrors(errors);
    paymentForm.setSubmitDisabled(errors.length > 0);
  };

  if (paymentChangeHandler) {
    events.off('payment:change', paymentChangeHandler);
    paymentChangeHandler = null;
  }
  if (orderStep1SubmitHandler) {
    events.off('order:step1:submit', orderStep1SubmitHandler);
    orderStep1SubmitHandler = null;
  }

  paymentChangeHandler = ({ payment, address }) => {
    validate({ payment, address });
  };
  events.on('payment:change', paymentChangeHandler);

  orderStep1SubmitHandler = ({ data }) => {
    validate(data);
    if (!data.payment || !data.address?.trim()) return;

    if (paymentChangeHandler) {
      events.off('payment:change', paymentChangeHandler);
      paymentChangeHandler = null;
    }
    if (orderStep1SubmitHandler) {
      events.off('order:step1:submit', orderStep1SubmitHandler);
      orderStep1SubmitHandler = null;
    }
    openContactFormStep({ address: data.address, payment: data.payment });
  };
  events.on('order:step1:submit', orderStep1SubmitHandler);

  paymentForm.setSubmitDisabled(true);
}

function openContactFormStep(step1Data: { address: string; payment: string }): void {
  const contactNode = cloneTemplate(tmplContacts) as HTMLFormElement;
  const contactForm = new ContactForm(contactNode, events);
  modal.open(contactNode);

  const validate = (data: { email: string; phone: string }) => {
    const errors: string[] = [];
    if (!data.email.trim()) errors.push('Укажите email');
    if (!data.phone.trim()) errors.push('Укажите телефон');
    contactForm.showErrors(errors);
    contactForm.setSubmitDisabled(errors.length > 0);
  };

  if (contactChangeHandler) {
    events.off('contact:change', contactChangeHandler);
    contactChangeHandler = null;
  }
  if (orderSubmitHandler) {
    events.off('order:submit', orderSubmitHandler);
    orderSubmitHandler = null;
  }

  contactChangeHandler = ({ data }) => {
    validate(data);
  };
  events.on('contact:change', contactChangeHandler);

  orderSubmitHandler = ({ data }) => {
    validate(data);
    if (!data.email.trim() || !data.phone.trim()) return;

    const order = {
      ...step1Data,
      ...data,
      items: cart.getItems(),
    };
    events.emit('order:created', order);

    const total = cart.getTotalPrice();

    const orderSuccess = new OrderSuccess(
      cloneTemplate(tmplSuccess),
      () => modal.close()
    );
    orderSuccess.setTotal(total);
    modal.open(orderSuccess.render());

    if (contactChangeHandler) {
      events.off('contact:change', contactChangeHandler);
      contactChangeHandler = null;
    }
    if (orderSubmitHandler) {
      events.off('order:submit', orderSubmitHandler);
      orderSubmitHandler = null;
    }

    cart.clear();
    buyer.clear();
    events.emit('cart:updated', { items: cart.getItems() });
  };
  events.on('order:submit', orderSubmitHandler);

  contactForm.setSubmitDisabled(true);
}

const orderBtn = document.querySelector(".basket__button") as HTMLButtonElement;
if (orderBtn) {
  orderBtn.addEventListener("click", () => {
    if (cart.getItems().length > 0) {
      openOrderForm();
    }
  });
}

events.on<{ products: any[] }>("catalog:changed", ({ products }) => {
  productsById.clear();
  products.forEach(p => productsById.set(String(p.id), p));

  const items = products.map(createCatalogCard);
  gallery.setCatalog(items);
  gallery.render({});
});

async function loadCatalogFromServer() {
  const PRICE_OVERRIDES_BY_ID: Record<string, number> = {
    '6a834fb8-350a-440c-ab55-d0e9b959b6e3': 150000,
  };

  try {
    const products = await apiService.getProducts();
    const adjusted = products.map((p: IProduct) =>
      PRICE_OVERRIDES_BY_ID[p.id] != null
        ? { ...p, price: PRICE_OVERRIDES_BY_ID[p.id] }
        : p
    );
    console.log("[API] products received:", products.length);
    catalog.setProducts(adjusted);
  } catch (err) {
    console.error("Ошибка загрузки каталога:", err);
  }
}

console.log("[BOOT] main initialized. Cart count =", cart.getItems().length);
console.log("[START] loading products from API:", `${API_URL}/product/`);
loadCatalogFromServer();
