import "./scss/styles.scss";
import { Catalog } from "./components/base/Models/catalog";
import { Cart } from "./components/base/Models/cart";
import { Buyer } from "./components/base/Models/buyer";
import { apiProducts } from "./utils/data";
import { Api } from "./components/base/Api";
import { ApiService } from "./components/ApiService";

const catalog = new Catalog();
catalog.setProducts(apiProducts.items);
console.log("Массив товаров из каталога:", catalog.getProducts());

const selected = catalog.getProductById(apiProducts.items[0].id);
catalog.setSelectedProduct(selected!);
console.log("Выбранный товар:", catalog.getSelectedProduct());

const cart = new Cart();
cart.addItem(apiProducts.items[0]);
cart.addItem(apiProducts.items[1]);
console.log("Товары в корзине:", cart.getItems());
console.log("Общая стоимость:", cart.getTotalPrice());
console.log("Количество товаров:", cart.getCount());
cart.removeItem(apiProducts.items[0].id);
console.log("Корзина после удаления:", cart.getItems());
cart.clear();
console.log("Корзина после очистки:", cart.getItems());

const buyer = new Buyer();
buyer.setData({ email: "test@example.com", payment: "card" });
console.log("Данные покупателя:", buyer.getData());
console.log("Ошибки валидации:", buyer.validate());
buyer.clear();
console.log("Данные после очистки:", buyer.getData());

const api = new Api("http://localhost:5173/");
const apiService = new ApiService(api);

async function loadCatalogFromServer() {
  try {
    const productsFromServer = await apiService.getProducts();
    catalog.setProducts(productsFromServer);
    console.log("Каталог загружен с сервера:", catalog.getProducts());
  } catch (err) {
    console.error("Ошибка при загрузке каталога с сервера:", err);
  }
}

loadCatalogFromServer();
