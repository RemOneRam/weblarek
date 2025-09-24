import { IApi, IProduct, IBuyer, IOrder } from '../types';

export class ApiService {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  async getProducts(): Promise<IProduct[]> {
    const response = await this.api.get<{ products: IProduct[] }>('/product/');
    return response.products;
  }

  async sendOrder(buyer: IBuyer, items: IProduct[]): Promise<object> {
    const order: IOrder = { buyer, items };
    return this.api.post('/order/', order);
  }
}