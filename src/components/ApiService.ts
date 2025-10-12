import { IApi, IProduct, IBuyer, IOrder } from '../types';

export class ApiService {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  async getProducts(): Promise<IProduct[]> {
    const response = await this.api.get<IProduct[] | { items?: IProduct[] }>('/product/');
    if (Array.isArray(response)) return response;
    if (response && (response as any).items && Array.isArray((response as any).items)) {
      return (response as any).items;
    }
    throw new Error('Некорректный ответ от сервера при загрузке каталога');
  }

  async sendOrder(buyer: IBuyer, items: IProduct[]): Promise<object> {
    const order: IOrder = { buyer, items };
    return this.api.post<object>('/order/', order);
  }
}