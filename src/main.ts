import "./scss/styles.scss";

import { Catalog } from "./components/base/Models/catalog";
import { Cart } from "./components/base/Models/cart";
import { Buyer } from "./components/base/Models/buyer";

import { Api } from "./components/base/Api";
import { ApiService } from "./components/ApiService";
import { API_URL, CDN_URL } from "./utils/constants";

import { EventEmitter } from "./components/base/Events";

// Views
import { Header } from "./view/header";
import { Gallery } from "./view/gallery";
import { Modal } from "./view/Modal";
import { CatalogProductCard } from "./view/CatalogProductCard";
import { PreviewProductCard } from "./view/PreviewProductCard";
import { BasketProductCard } from "./view/BasketProductCard";
import { Basket } from "./view/Basket";
import { PaymentForm } from "./view/PaymentForm";
import { ContactForm } from "./view/ContactForm";
import { OrderSuccess } from "./view/OrderSuccess";

/* -------------------- Инициализация -------------------- */
const events = new EventEmitter();

const catalog = new Catalog(events);
const cart = new Cart(events);
const buyer = new Buyer(events);

const api = new Api(API_URL);
const apiService = new ApiService(api);

/* Root элементы */
const headerContainer = document.querySelector('.header__container') as HTMLElement | null;
const galleryContainer = document.querySelector('.gallery') as HTMLElement | null;
const modalElement = document.getElementById('modal-container') as HTMLElement | null;

if (!headerContainer || !galleryContainer || !modalElement) {
  throw new Error('Не найдены корневые элементы: header, gallery или modal.');
}

/* View-инстансы */
const header = new Header(headerContainer, events);
const gallery = new Gallery(galleryContainer);
const modal = new Modal(modalElement);

/* Шаблоны */
const tmplCardCatalog = document.getElementById('card-catalog') as HTMLTemplateElement | null;
const tmplCardPreview = document.getElementById('card-preview') as HTMLTemplateElement | null;
const tmplCardBasket = document.getElementById('card-basket') as HTMLTemplateElement | null;
const tmplBasket = document.getElementById('basket') as HTMLTemplateElement | null;
const tmplOrder = document.getElementById('order') as HTMLTemplateElement | null;
const tmplContacts = document.getElementById('contacts') as HTMLTemplateElement | null;
const tmplSuccess = document.getElementById('success') as HTMLTemplateElement | null;

if (!tmplCardCatalog || !tmplCardPreview || !tmplCardBasket || !tmplBasket || !tmplOrder || !tmplContacts || !tmplSuccess) {
  throw new Error('Отсутствует один из шаблонов.');
}

/* -------------------- Утилиты -------------------- */
function cloneTemplate(t: HTMLTemplateElement | null): HTMLElement {
  if (!t) throw new Error('Шаблон не найден');
  const first = t.content.firstElementChild;
  if (!first) throw new Error('Шаблон пустой');
  return first.cloneNode(true) as HTMLElement;
}

function getImageSrc(image?: string): string {
  if (!image) return '/img/fallback.png';
  return `${CDN_URL}/${image}`;
}

/* -------------------- Создание карточек -------------------- */
function createCatalogCard(product: any): HTMLElement {
  const node = cloneTemplate(tmplCardCatalog);
  node.dataset.productId = product.id;

  const img = node.querySelector<HTMLImageElement>('.card__image');
  if (img) img.src = getImageSrc(product.image);

  const cardView = new CatalogProductCard(node, events);
  cardView.render(product);
  return node;
}

function createPreviewCard(product: any): HTMLElement {
  const node = cloneTemplate(tmplCardPreview);
  node.dataset.productId = product.id;

  const img = node.querySelector<HTMLImageElement>('.card__image');
  if (img) img.src = getImageSrc(product.image);

  const cardView = new PreviewProductCard(node, events);
  cardView.render(product);
  return node;
}

function createBasketCard(product: any, index: number): HTMLElement {
  const node = cloneTemplate(tmplCardBasket);
  node.dataset.productId = product.id;

  const cardView = new BasketProductCard(node, events);
  cardView.render(product);

  const idxEl = node.querySelector('.basket__item-index') as HTMLElement | null;
  if (idxEl) idxEl.textContent = String(index + 1);

  return node;
}

function buildBasketNode(items: any[]) {
  const node = cloneTemplate(tmplBasket);
  const basketView = new Basket(node);

  const itemNodes = items.map((p, idx) => createBasketCard(p, idx));
  basketView.setItems(itemNodes);
  basketView.setTotal(items.reduce((s, it) => s + (it.price ?? 0), 0));
  basketView.setButtonState(items.length > 0);

  return node;
}

/* -------------------- События -------------------- */
events.on<{ products: any[] }>('catalog:changed', ({ products }) => {
  const items = products.map(p => createCatalogCard(p));
  gallery.setCatalog(items);
  gallery.render({});
});

events.on<{ items: any[]; total: number }>('cart:updated', ({ items }) => {
  header.setCounter(items.length);

  if (modalElement.classList.contains('modal_active') && modalElement.querySelector('.basket')) {
    const basketNode = buildBasketNode(items);
    modal.setContent(basketNode);

    const orderBtn = modalElement.querySelector('.basket__button') as HTMLButtonElement | null;
    if (orderBtn) {
      const newBtn = orderBtn.cloneNode(true) as HTMLButtonElement;
      orderBtn.replaceWith(newBtn);
      newBtn.addEventListener('click', () => openOrderStep1());
    }
  }
});

events.on('cart:cleared', () => {
  header.setCounter(0);
  if (modalElement.classList.contains('modal_active') && modalElement.querySelector('.basket')) {
    modal.setContent(buildBasketNode([]));
  }
});

/* -------------------- DOM делегирование (галерея) -------------------- */
galleryContainer.addEventListener('click', (ev) => {
  const target = ev.target as HTMLElement;
  const card = target.closest('.card') as HTMLElement | null;
  if (!card) return;

  const productId = card.dataset.productId;
  if (!productId) return;
  const product = catalog.getProductById(productId);
  if (!product) return;

  const btn = target.closest('button') as HTMLButtonElement | null;
  if (btn) {
    ev.stopPropagation();
    if (cart.hasItem(productId)) cart.removeItem(productId);
    else cart.addItem(product);

    events.emit('cart:updated', { items: cart.getItems(), total: cart.getTotalPrice() });
    return;
  }

  const preview = createPreviewCard(product);
  setTimeout(() => {
    const previewBtn = preview.querySelector('button') as HTMLButtonElement | null;
    if (previewBtn) {
      previewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!cart.hasItem(productId)) cart.addItem(product);
        else cart.removeItem(productId);
        events.emit('cart:updated', { items: cart.getItems(), total: cart.getTotalPrice() });
        modal.close();
      });
    }
  }, 0);

  modal.open(preview);
});

/* -------------------- DOM делегирование (модальное окно) -------------------- */
modalElement.addEventListener('click', (ev) => {
  const target = ev.target as HTMLElement;

  const delBtn = target.closest('.basket__item-delete') as HTMLElement | null;
  if (delBtn) {
    const itemNode = delBtn.closest('[data-product-id]') as HTMLElement | null;
    if (!itemNode) return;
    const pid = itemNode.dataset.productId;
    if (!pid) return;
    cart.removeItem(pid);
    events.emit('cart:updated', { items: cart.getItems(), total: cart.getTotalPrice() });
    return;
  }

  const orderBtn = target.closest('.basket__button') as HTMLButtonElement | null;
  if (orderBtn) {
    openOrderStep1();
    return;
  }

  const form = target.closest('form') as HTMLFormElement | null;
  if (!form) return;
  if (form.name === 'order') {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      openOrderStep2();
    }, { once: true });
  }
  if (form.name === 'contacts') {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const email = String(fd.get('email') ?? '').trim();
      const phone = String(fd.get('phone') ?? '').trim();
      if (!email || !phone) return alert('Заполните email и телефон');
      buyer.setData({ email, phone });
      try {
        await apiService.sendOrder(buyer.getData(), cart.getItems());
        cart.clear();
        buyer.clear();
        const node = cloneTemplate(tmplSuccess);
        const successView = new OrderSuccess(node);
        successView.setTotal(cart.getTotalPrice());
        modal.open(node);
      } catch (err) {
        console.error(err);
        alert('Ошибка отправки заказа');
      }
    }, { once: true });
  }
});

/* -------------------- Шаги заказа -------------------- */
function openOrderStep1() {
  const node = cloneTemplate(tmplOrder);
  const formEl = node.querySelector('form') as HTMLFormElement | null;
  if (formEl) new PaymentForm(formEl, events);
  modal.open(node);
}

function openOrderStep2() {
  const node = cloneTemplate(tmplContacts);
  const formEl = node.querySelector('form') as HTMLFormElement | null;
  if (formEl) new ContactForm(formEl, events);
  modal.open(node);
}

/* -------------------- Загрузка каталога -------------------- */
async function loadCatalogFromServer() {
  try {
    const products = await apiService.getProducts();
    catalog.setProducts(products);
  } catch (err) {
    console.error('Ошибка загрузки каталога:', err);
  }
}

loadCatalogFromServer();
