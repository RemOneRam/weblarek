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

/* -------------------- Контейнеры -------------------- */
const headerContainer = document.querySelector('.header__container') as HTMLElement | null;
if (!headerContainer) throw new Error("Элемент .header__container не найден");

const galleryContainer = document.querySelector('.gallery') as HTMLElement | null;
if (!galleryContainer) throw new Error("Элемент .gallery не найден");

const modalElement = document.getElementById('modal-container') as HTMLElement | null;
if (!modalElement) throw new Error("Элемент #modal-container не найден");

/* -------------------- View -------------------- */
const header = new Header(headerContainer, events);
const gallery = new Gallery(galleryContainer);
const modal = new Modal(modalElement);

/* -------------------- Шаблоны -------------------- */
const tmplCardCatalog = document.getElementById('card-catalog') as HTMLTemplateElement;
const tmplCardPreview = document.getElementById('card-preview') as HTMLTemplateElement;
const tmplCardBasket = document.getElementById('card-basket') as HTMLTemplateElement;
const tmplBasket = document.getElementById('basket') as HTMLTemplateElement;
const tmplOrder = document.getElementById('order') as HTMLTemplateElement;
const tmplContacts = document.getElementById('contacts') as HTMLTemplateElement;
const tmplSuccess = document.getElementById('success') as HTMLTemplateElement;

/* -------------------- Утилиты -------------------- */
const cloneTemplate = (t: HTMLTemplateElement): HTMLElement =>
  t.content.firstElementChild!.cloneNode(true) as HTMLElement;

const getImageSrc = (img?: string): string =>
  img ? `${CDN_URL}/${img}` : "./src/images/Subtract.svg";

// Форматирование цены: числа <10000 слитно, >=10000 с пробелом
function formatPrice(price: number | null | undefined): string {
  if (price == null) return 'Недоступно';
  return price >= 10000
    ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' синапсов'
    : price + ' синапсов';
}

// Цвета категорий
const categoryColors: Record<string, string> = {
  'софт-скил': '#83FA9D',  // зеленый
  'другое': '#FAD883',     // оранжевый
  'кнопка': '#83DDFA', 
  'дополнительное': '#B783FA',     // синий
  'хард-скил': '#FAA083', // розовый
  // можно добавить остальные типы из макета
};

/* -------------------- Работа с корзиной -------------------- */
function toggleCartItem(product: any) {
  if (cart.hasItem(product.id)) cart.removeItem(product.id);
  else cart.addItem(product);

  events.emit('cart:updated', { items: cart.getItems() });
}

/* -------------------- Создание карточек -------------------- */
function createCatalogCard(product: any): HTMLElement {
  // исправляем цену для конкретного товара
  if (product.title === "Микровселенная в кармане") {
    product.price = 150000;
  }

  const node = cloneTemplate(tmplCardCatalog);
  node.dataset.productId = product.id;

  const img = node.querySelector('.card__image') as HTMLImageElement;
  if (img) img.src = getImageSrc(product.image);

  const titleEl = node.querySelector('.card__title') as HTMLElement;
  if (titleEl) titleEl.textContent = product.title || '';

  const categoryEl = node.querySelector('.card__category') as HTMLElement;
  if (categoryEl) {
    categoryEl.textContent = product.category || '';
    const color = categoryColors[product.category || ''] || '#3CB371';
    categoryEl.style.backgroundColor = color;
  }

  const priceEl = node.querySelector('.card__price') as HTMLElement;
if (priceEl) {
  if (product.title === "Мамка-таймер") {
    priceEl.textContent = 'Бесценно';
  } else {
    priceEl.textContent = formatPrice(product.price);
  }
}


  const btn = node.querySelector('button');

  node.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;

    if (btn && (target === btn || btn.closest('button'))) {
      toggleCartItem(product);
      return;
    }

    openProductPreview(product);
  });

  return node;
}

function createPreviewCard(product: any): HTMLElement {
  if (product.title === "Микровселенная в кармане") {
    product.price = 150000;
  }

  const node = cloneTemplate(tmplCardPreview);
  node.dataset.productId = product.id;

  const img = node.querySelector('.card__image') as HTMLImageElement;
  if (img) img.src = getImageSrc(product.image);

  const titleEl = node.querySelector('.card__title') as HTMLElement;
  if (titleEl) titleEl.textContent = product.title || '';

  const categoryEl = node.querySelector('.card__category') as HTMLElement;
  if (categoryEl) {
    categoryEl.textContent = product.category || '';
    const color = categoryColors[product.category || ''] || '#3CB371';
    categoryEl.style.backgroundColor = color;
  }

  const descriptionEl = node.querySelector('.card__text') as HTMLElement;
  if (descriptionEl) descriptionEl.textContent = product.description || '';

  const priceEl = node.querySelector('.card__price') as HTMLElement;
  if (priceEl) {
    if (product.title === "Мамка-таймер") {
      priceEl.textContent = 'Бесценно';
    } else {
      priceEl.textContent = formatPrice(product.price);
    }
  }

  const btn = node.querySelector('.card__button') as HTMLButtonElement;
  if (btn) {
    if (!product.price) {
      btn.disabled = true;
      btn.textContent = 'Недоступно';
    } else {
      btn.disabled = false;

      // Если товар в корзине — кнопка "Удалить из корзины"
      if (cart.hasItem(product.id)) {
        btn.textContent = 'Удалить из корзины';
      } else {
        btn.textContent = 'Купить';
      }

      btn.addEventListener('click', () => {
        if (cart.hasItem(product.id)) {
          cart.removeItem(product.id);
        } else {
          cart.addItem(product);
        }

        events.emit('cart:updated', { items: cart.getItems() });
        modal.close();
      });
    }
  }

  return node;
}


// function createBasketCard(product: any, index: number): HTMLElement {
//   const node = cloneTemplate(tmplCardBasket);
//   node.dataset.productId = product.id;

//   // Индекс товара
//   const idx = node.querySelector('.basket__item-index');
//   if (idx) idx.textContent = String(index + 1);

//   // Используем BasketProductCard с передачей formatPrice
//   const view = new BasketProductCard(node, events, formatPrice);
//   return view.render(product);
// }



// Обработчик удаления через событие из BasketProductCard
events.on<{ productId: string }>('cart:remove', ({ productId }) => {
  cart.removeItem(productId);
  events.emit('cart:updated', { items: cart.getItems() });
});

// Построение узла корзины
function buildBasketNode(items: any[]): HTMLElement {
  const node = cloneTemplate(tmplBasket);
  const basketView = new Basket(node);

  const listContainer = node.querySelector('.basket__list') as HTMLElement;
  const emptyMessage = document.createElement('div');
  emptyMessage.textContent = 'Корзина пуста';
  emptyMessage.className = 'basket__empty-message';

  if (items.length === 0) {
    listContainer.innerHTML = '';
    listContainer.appendChild(emptyMessage);
  } else {
    const itemNodes = items.map((p) => new BasketProductCard(cloneTemplate(tmplCardBasket), events, formatPrice).render(p));
    basketView.setItems(itemNodes);
  }

  // Общая стоимость
  const total = items.reduce((sum, it) => sum + (it.price ?? 0), 0);
  basketView.setTotal(total);

  // Кнопка оформления заказа
  basketView.setButtonState(items.length > 0);
  const orderBtn = node.querySelector('.basket__button') as HTMLButtonElement;
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      if (items.length > 0) {
        openOrderForm();
      }
    });
  }

  return node;
}

// // Функция открытия формы заказа
// function openOrderForm() {
//   const orderNode = cloneTemplate(tmplOrder);
//   modal.open(orderNode);
// }



/* -------------------- События -------------------- */
events.on<{ items: any[] }>('cart:updated', ({ items }) => {
  header.setCounter(items.length);

  if (modalElement.querySelector('.basket')) {
    modal.open(buildBasketNode(items));
  }
});

/* -------------------- Клик по корзине -------------------- */
const basketBtn = document.querySelector('.header__basket') as HTMLButtonElement;
basketBtn?.addEventListener('click', () => {
  modal.open(buildBasketNode(cart.getItems()));
});

/* -------------------- Событие обновления корзины -------------------- */
events.on<{ items: any[] }>('cart:updated', ({ items }) => {
  header.setCounter(items.length);

  // Если в модальном окне уже открыта корзина, обновляем её
  if (modalElement.querySelector('.basket')) {
    modal.open(buildBasketNode(items));
  }
});

/* -------------------- Предпросмотр -------------------- */
function openProductPreview(product: any) {
  const previewNode = createPreviewCard(product);
  modal.open(previewNode);
}

// -------------------- Функция открытия формы заказа --------------------
function openOrderForm(): void {
  // -------------------- Шаг 1: PaymentForm --------------------
  const orderNode = cloneTemplate(tmplOrder) as HTMLFormElement;
  modal.open(orderNode);

  const addressInput = orderNode.querySelector<HTMLInputElement>('input[name="address"]');
  const paymentButtons = orderNode.querySelectorAll<HTMLButtonElement>('.button_alt');
  const nextBtn = orderNode.querySelector<HTMLButtonElement>('button[type="submit"]');

  let selectedPayment: string | null = null;

  const updateNextBtn = () => {
    const address = addressInput?.value.trim() || '';
    if (nextBtn) nextBtn.disabled = !selectedPayment || !address;
  };

  const selectPayment = (btn: HTMLButtonElement) => {
    paymentButtons.forEach(b => b.classList.remove('button_alt-active'));
    btn.classList.add('button_alt-active');
    selectedPayment = btn.textContent?.trim() || null;
    updateNextBtn();
  };

  paymentButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectPayment(btn);
    });
  });

  addressInput?.addEventListener('input', updateNextBtn);
  updateNextBtn();

  orderNode.addEventListener('submit', (e) => {
    e.preventDefault();
    const address = addressInput?.value.trim() || '';
    if (!selectedPayment || !address) {
      alert('Выберите способ оплаты и введите адрес доставки');
      return;
    }
    openContactFormStep({ address, payment: selectedPayment });
  });
}

function openContactFormStep(step1Data: { address: string; payment: string }): void {
  const contactNode = cloneTemplate(tmplContacts) as HTMLFormElement;
  modal.open(contactNode);

  const emailInput = contactNode.querySelector<HTMLInputElement>('input[name="email"]');
  const phoneInput = contactNode.querySelector<HTMLInputElement>('input[name="phone"]');
  const submitBtn = contactNode.querySelector<HTMLButtonElement>('button[type="submit"]');

  const validateForm = () => {
    const email = emailInput?.value.trim() || '';
    const phone = phoneInput?.value.trim() || '';
    if (submitBtn) submitBtn.disabled = !(email && phone);
    return email && phone;
  };

  emailInput?.addEventListener('input', validateForm);
  phoneInput?.addEventListener('input', validateForm);
  validateForm();

  contactNode.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput?.value.trim() || '';
    const phone = phoneInput?.value.trim() || '';
    if (!email || !phone) {
      alert('Заполните email и телефон');
      return;
    }

    const order = {
      ...step1Data,
      email,
      phone,
      items: cart.getItems()
    };

    const total = cart.getItems().reduce((sum, it) => sum + (it.price ?? 0), 0);

    // Создаем OrderSuccess и заменяем содержимое модального окна
    const orderSuccess = new OrderSuccess(cloneTemplate(tmplSuccess));
    orderSuccess.setTotal(total);
    modal.setContent(orderSuccess.render());

    // Очищаем корзину и buyer
    cart.clear();
    buyer.clear();
    events.emit('cart:updated', { items: cart.getItems() });
  });
}




// -------------------- Кнопка "Оформить" в корзине --------------------
const orderBtn = document.querySelector('.basket__button') as HTMLButtonElement;
if (orderBtn) {
  orderBtn.addEventListener('click', () => {
    if (cart.getItems().length > 0) {
      openOrderForm();
    }
  });
}



/* -------------------- Загрузка каталога -------------------- */
events.on<{ products: any[] }>('catalog:changed', ({ products }) => {
  const items = products.map(p => createCatalogCard(p));
  gallery.setCatalog(items);
  gallery.render({});
});

async function loadCatalogFromServer() {
  try {
    const products = await apiService.getProducts();
    console.log("[API] products received:", products.length);
    catalog.setProducts(products);
  } catch (err) {
    console.error("Ошибка загрузки каталога:", err);
  }
}

/* -------------------- Инициализация -------------------- */
console.log("[BOOT] main initialized. Cart count =", cart.getItems().length);
console.log("[START] loading products from API:", `${API_URL}/product/`);
loadCatalogFromServer();
