import "./scss/styles.scss";

import { EventEmitter } from "./components/base/Events";
import { Catalog } from "./components/base/Models/catalog";
import { Cart } from "./components/base/Models/cart";
import { Buyer } from "./components/base/Models/buyer";
import { Api } from "./components/base/Api";
import { ApiService } from "./components/ApiService";

// Представления (view)
import { Gallery } from "../src/view/gallery";
import { CatalogProductCard } from "../src/view/CatalogProductCard";
import { PreviewProductCard } from "../src/view/PreviewProductCard";
import { Modal } from "../src/view/Modal";
import { Header } from "../src/view/header";
import { Basket } from "../src/view/Basket";
import { BasketProductCard } from "../src/view/BasketProductCard";
import { PaymentForm } from "../src/view/PaymentForm";
import { ContactForm } from "../src/view/ContactForm";
import { OrderSuccess } from "../src/view/OrderSuccess";

// общий брокер
const emitter = new EventEmitter();

// модели (передаём emitter)
const catalog = new Catalog(emitter);
const cart = new Cart(emitter);
const buyer = new Buyer(emitter);

// api
const api = new Api("http://localhost:5173/");
const apiService = new ApiService(api);

// view — контейнеры
const galleryContainer = document.querySelector("main.gallery") as HTMLElement;
const gallery = new Gallery(galleryContainer, emitter);

const modalContainer = document.body as HTMLElement;
const modal = new Modal(modalContainer, emitter);

const headerContainer = document.querySelector(".header") as HTMLElement;
const header = new Header(headerContainer, emitter);

const basketContainer = document.querySelector(".basket") as HTMLElement || document.createElement("div");
const basket = new Basket(basketContainer, emitter);

const paymentFormEl = document.querySelector(".form-payment") as HTMLFormElement | null;
const contactFormEl = document.querySelector(".form-contact") as HTMLFormElement | null;
const orderSuccessContainer = document.querySelector(".order-success") as HTMLElement | null;

const paymentForm = paymentFormEl ? new PaymentForm(paymentFormEl, emitter) : null;
const contactForm = contactFormEl ? new ContactForm(contactFormEl, emitter) : null;
const orderSuccess = orderSuccessContainer ? new OrderSuccess(orderSuccessContainer, emitter) : null;

/* ========== обработчики ========== */

// при изменении каталога — формируем карточки и рендерим
emitter.on("catalog:changed", () => {
  const products = catalog.getProducts();

  const cardElements: HTMLElement[] = products.map((product) => {
    const template = document.querySelector("#card-template") as HTMLTemplateElement | null;
    const cardEl = template && template.content.firstElementChild
      ? (template.content.firstElementChild!.cloneNode(true) as HTMLElement)
      : document.createElement("div");

    cardEl.dataset.productId = product.id;

    const card = new CatalogProductCard(cardEl, emitter);
    if ((card as any).setTitle) (card as any).setTitle(product.title);
    if ((card as any).setPrice) (card as any).setPrice(product.price ?? null);
    if ((card as any).setImage) (card as any).setImage(product.image, product.title);
    if ((card as any).setCategory) (card as any).setCategory(product.category);
    if ((card as any).setButtonLabel) (card as any).setButtonLabel("Купить");

    return card.render();
  });

  gallery.setCatalog(cardElements);
  galleryContainer.replaceChildren(gallery.render());
});

// выбор товара в view
emitter.on("product:select", (payload: { element: HTMLElement }) => {
  const el = payload?.element as HTMLElement | undefined;
  const id = el?.dataset?.productId;
  if (!id) return;
  const product = catalog.getProductById(id);
  if (!product) return;
  catalog.setSelectedProduct(product);
});

// на catalog:selected — показываем превью в модалке
emitter.on("catalog:selected", (payload: { product: any }) => {
  const product = payload.product;
  if (!product) return;
  const template = document.querySelector("#card-preview-template") as HTMLTemplateElement | null;
  const el = template && template.content.firstElementChild
    ? (template.content.firstElementChild!.cloneNode(true) as HTMLElement)
    : document.createElement("div");

  el.dataset.productId = product.id;
  const previewCard = new PreviewProductCard(el, emitter);
  if ((previewCard as any).setTitle) (previewCard as any).setTitle(product.title);
  if ((previewCard as any).setPrice) (previewCard as any).setPrice(product.price ?? null);
  if ((previewCard as any).setImage) (previewCard as any).setImage(product.image, product.title);
  if ((previewCard as any).setCategory) (previewCard as any).setCategory(product.category);

  modal.open(previewCard.render());
});

// на product:buy — добавляем в корзину
emitter.on("product:buy", (payload: { element: HTMLElement }) => {
  const el = payload?.element as HTMLElement | undefined;
  const id = el?.dataset?.productId;
  if (!id) return;
  const product = catalog.getProductById(id);
  if (!product) return;
  cart.addItem(product);
});

// удаление товара из корзины
emitter.on("cart:remove", (payload: { element: HTMLElement }) => {
  const el = payload?.element as HTMLElement | undefined;
  const id = el?.dataset?.productId;
  if (!id) return;
  cart.removeItem(id);
});

// открытие модалки
emitter.on("modal:open", (payload: { modal: string }) => {
  const modalName = payload?.modal;
  if (!modalName) return;

  if (modalName === "cart") {
    modal.open(basket.render());
  } else if (modalName === "checkout") {
    if (paymentForm) modal.open(paymentForm.render());
  }
});

// закрытие модалки
emitter.on("modal:close", () => {
  modal.close();
});

// изменения корзины — обновляем basket и header
emitter.on("cart:changed", () => {
  const items = cart.getItems();
  const basketNodes: HTMLElement[] = items.map((item) => {
    const template = document.querySelector("#cart-card-template") as HTMLTemplateElement | null;
    const el = template && template.content.firstElementChild
      ? (template.content.firstElementChild!.cloneNode(true) as HTMLElement)
      : document.createElement("div");

    el.dataset.productId = item.id;

    const card = new BasketProductCard(el, emitter);
    if ((card as any).setTitle) (card as any).setTitle(item.title);
    if ((card as any).setPrice) (card as any).setPrice(item.price ?? null);
    if ((card as any).setImage) (card as any).setImage(item.image, item.title);
    if ((card as any).setCategory) (card as any).setCategory(item.category);

    return card.render();
  });

  basket.setItems(basketNodes);
  basket.setTotal(cart.getTotalPrice());
  header.setCounter(cart.getCount());
});

emitter.on("cart:cleared", () => {
  basket.setItems([]);
  basket.setTotal(0);
  header.setCounter(0);
});

emitter.on("buyer:changed", (payload: { buyer: any }) => {
  const b = payload?.buyer;
  if (!b) return;
  if (paymentForm) {
    if ((paymentForm as any).setPayment) (paymentForm as any).setPayment(b.payment ?? "");
    if ((paymentForm as any).setAddress) (paymentForm as any).setAddress(b.address ?? "");
  }
  if (contactForm) {
    if ((contactForm as any).setEmail) (contactForm as any).setEmail(b.email ?? "");
    if ((contactForm as any).setPhone) (contactForm as any).setPhone(b.phone ?? "");
  }
});

emitter.on("payment:change", (payload: { payment: string }) => {
  const p = payload?.payment as any;
  if (!p) return;
  buyer.setData({ payment: p });
});

// обработка отправки форм
emitter.on("form:submit", (payload: { form: HTMLFormElement; data: FormData }) => {
  const form = payload?.form;
  const data = payload?.data;
  if (!form || !data) return;

  if (form.classList.contains("form-payment")) {
    const paymentVal = (data.get("payment") as string) || "";
    const addressVal = (data.get("address") as string) || "";
    buyer.setData({ payment: (paymentVal as any), address: addressVal });

    if (contactForm) modal.setContent(contactForm.render());
  }
});

emitter.on("order:submit", async (payload: { data: any }) => {
  const formData = payload?.data;
  if (!formData) return;
  buyer.setData(formData);
  const totalBefore = cart.getTotalPrice();

  try {
    await apiService.sendOrder(buyer.getData(), cart.getItems());
    cart.clear();
    buyer.clear();

    if (orderSuccess) {
      orderSuccess.setTotal(totalBefore);
      modal.open(orderSuccess.render());
    }
  } catch (err) {
    console.error("Ошибка при отправке заказа:", err);
  }
});

// загрузка каталога с сервера
async function loadCatalogFromServer() {
  try {
    const productsFromServer = await apiService.getProducts();
    catalog.setProducts(productsFromServer);
  } catch (err) {
    console.error("Ошибка при загрузке каталога с сервера:", err);
  }
}

loadCatalogFromServer();