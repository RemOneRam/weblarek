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

/**
 * Presenter (реализация в main.ts)
 *
 * Подход: один презентер (код в main.ts) — устанавливает связи между моделями и представлениями,
 * подписывается на события EventEmitter и вызывает методы моделей и представлений.
 * Презентер не генерирует события — он только обрабатывает их.
 */

// общий брокер событий
const emitter = new EventEmitter();

// модели (передаём emitter, чтобы модели могли эмитить события)
const catalog = new Catalog(emitter);
const cart = new Cart(emitter);
const buyer = new Buyer(emitter);

// API
const api = new Api("http://localhost:5173/");
const apiService = new ApiService(api);

// --- создаём представления, передаём им контейнеры и emitter ---

// main.gallery — контейнер каталога
const galleryContainer = document.querySelector("main.gallery") as HTMLElement;
const gallery = new Gallery(galleryContainer, emitter);

// modal — контейнер (передаём body/root, внутри Modal найдёт .modal)
const modalContainer = document.body as HTMLElement;
const modal = new Modal(modalContainer, emitter);

// header
const headerContainer = document.querySelector(".header") as HTMLElement;
const header = new Header(headerContainer, emitter);

// корзина (вид)
const basketContainer = document.querySelector(".basket") as HTMLElement || document.createElement("div");
const basket = new Basket(basketContainer, emitter);

// формы и компоненты оформления (если в разметке присутствуют)
const paymentFormEl = document.querySelector(".form-payment") as HTMLFormElement | null;
const contactFormEl = document.querySelector(".form-contact") as HTMLFormElement | null;
const orderSuccessContainer = document.querySelector(".order-success") as HTMLElement | null;

const paymentForm = paymentFormEl ? new PaymentForm(paymentFormEl, emitter) : null;
const contactForm = contactFormEl ? new ContactForm(contactFormEl, emitter) : null;
const orderSuccess = orderSuccessContainer ? new OrderSuccess(orderSuccessContainer, emitter) : null;

// --- Обработчики событий (Presenter) ---

// 1) Когда модель каталога изменилась — рендерим каталог в галерее
emitter.on("catalog:changed", () => {
  const products = catalog.getProducts();

  // собираем разметку карточек каталога
  const cardElements: HTMLElement[] = products.map((product) => {
    // предполагается, что в HTML есть шаблон с id="card-template"
    const template = document.querySelector("#card-template") as HTMLTemplateElement | null;
    if (!template || !template.content.firstElementChild) {
      // если шаблона нет — создаём простой элемент (минимально), чтобы не ломать логику
      const fallback = document.createElement("div");
      fallback.textContent = product.title;
      fallback.dataset.productId = product.id;
      return fallback;
    }
    const cardEl = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    // сохраняем id товара в data-атрибуте — презентер будет по нему находить товар
    cardEl.dataset.productId = product.id;

    const card = new CatalogProductCard(cardEl, emitter);
    // используем методы view для установки данных (view не хранит данные модели)
    if ((card as any).setTitle) (card as any).setTitle(product.title);
    if ((card as any).setPrice) (card as any).setPrice(product.price ?? null);
    if ((card as any).setImage) (card as any).setImage(product.image, product.title);
    if ((card as any).setCategory) (card as any).setCategory(product.category);
    if ((card as any).setButtonLabel) (card as any).setButtonLabel("Купить");

    return card.render();
  });

  // передаём собранные элементы в компонент Gallery и отображаем
  gallery.setCatalog(cardElements);
  galleryContainer.replaceChildren(gallery.render());
});

// 2) Пользователь выбрал карточку для просмотра (view -> 'product:select')
//    Presenter устанавливает выбранный товар в модели (модель эмитит 'catalog:selected')
emitter.on("product:select", (payload: { element: HTMLElement }) => {
  const el = payload?.element as HTMLElement | undefined;
  const id = el?.dataset?.productId;
  if (!id) return;
  const product = catalog.getProductById(id);
  if (!product) return;
  catalog.setSelectedProduct(product);
});

// 3) На событие выбора товара в модели (catalog:selected) — открываем превью в модальном окне
emitter.on("catalog:selected", (payload: { product: any }) => {
  const product = payload.product;
  if (!product) return;

  // создаём/клонируем шаблон превью карточки (если он есть)
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

// 4) Пользователь нажал кнопку "Купить" в карточке (view -> 'product:buy')
//    Presenter добавляет товар в Cart (модель эмитит 'cart:changed')
emitter.on("product:buy", (payload: { element: HTMLElement }) => {
  const el = payload?.element as HTMLElement | undefined;
  const id = el?.dataset?.productId;
  if (!id) return;
  const product = catalog.getProductById(id);
  if (!product) return;
  cart.addItem(product);
});

// 5) Удаление товара из корзины (view -> 'cart:remove')
emitter.on("cart:remove", (payload: { element: HTMLElement }) => {
  const el = payload?.element as HTMLElement | undefined;
  const id = el?.dataset?.productId;
  if (!id) return;
  cart.removeItem(id);
});

// 6) Открытие модального окна (view -> 'modal:open')
//    Presenter решает, какой контент показать в модальном окне
emitter.on("modal:open", (payload: { modal: string }) => {
  const modalName = payload?.modal;
  if (!modalName) return;

  if (modalName === "cart") {
    modal.open(basket.render());
  } else if (modalName === "checkout") {
    // показываем форму оплаты (если есть)
    if (paymentForm) modal.open(paymentForm.render());
  } else {
    // при неизвестном имени — ничего не делаем (по ТЗ не добавляем лишней логики)
  }
});

// 7) Закрытие модального окна (view -> 'modal:close')
emitter.on("modal:close", () => {
  modal.close();
});

// 8) Изменение корзины в модели (cart:changed) — обновляем Basket view и Header счётчик
emitter.on("cart:changed", (payload: { items: any[] }) => {
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

// 9) Очистка корзины (cart:cleared) — обновляем представления
emitter.on("cart:cleared", () => {
  basket.setItems([]);
  basket.setTotal(0);
  header.setCounter(0);
});

// 10) Изменение данных покупателя в модели (buyer:changed) — обновляем формы
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

// 11) Вариант оплаты изменён во View (payment:change) — обновляем модель Buyer
emitter.on("payment:change", (payload: { payment: string }) => {
  const p = payload?.payment as any;
  if (!p) return;
  buyer.setData({ payment: p });
});

// 12) Обработка отправки формы (Form -> 'form:submit')
//     - если это форма оплаты — сохраняем данные в Buyer и переходим ко второй форме (контакты)
//     - если это контактная форма — (ContactForm обычно генерирует 'order:submit' сам), поэтому не дублируем
emitter.on("form:submit", (payload: { form: HTMLFormElement; data: FormData }) => {
  const form = payload?.form;
  const data = payload?.data;
  if (!form || !data) return;

  // опираемся на классы форм в разметке для определения шага (по классу)
  if (form.classList.contains("form-payment")) {
    // читаем поля и сохраняем в модель
    const paymentVal = (data.get("payment") as string) || "";
    const addressVal = (data.get("address") as string) || "";
    buyer.setData({ payment: (paymentVal as any), address: addressVal });

    // показываем контактную форму (если есть)
    if (contactForm) modal.setContent(contactForm.render());
  }
});

// 13) Финальная отправка заказа (ContactForm -> 'order:submit')
emitter.on("order:submit", async (payload: { data: any }) => {
  const formData = payload?.data;
  if (!formData) return;

  // Сохраняем контактные данные в модели
  buyer.setData(formData);

  // сохраняем итоговую сумму перед очисткой корзины
  const totalBefore = cart.getTotalPrice();

  try {
    // отправляем заказ на сервер
    await apiService.sendOrder(buyer.getData(), cart.getItems());

    // при успешной отправке — очищаем корзину и данные покупателя
    cart.clear();
    buyer.clear();

    // показываем сообщение об успешном заказе (если компонент есть)
    if (orderSuccess) {
      orderSuccess.setTotal(totalBefore);
      modal.open(orderSuccess.render());
    }
  } catch (err) {
    // По ТЗ: не добавляем лишней логики - просто логируем ошибку
    console.error("Ошибка при отправке заказа:", err);
  }
});

// --- Инициализация: загрузка каталога с сервера ---
// Удаляем тестовый код — оставляем только вызов загрузки каталога и запись её в модель
async function loadCatalogFromServer() {
  try {
    const productsFromServer = await apiService.getProducts();
    catalog.setProducts(productsFromServer);
  } catch (err) {
    console.error("Ошибка при загрузке каталога с сервера:", err);
  }
}

loadCatalogFromServer();
