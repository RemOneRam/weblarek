import { IBuyer, TPayment } from '../../../types';
import { EventEmitter } from '../../base/Events';

export class Buyer {
  private payment: TPayment | null = null;
  private address: string | null = null;
  private email: string | null = null;
  private phone: string | null = null;
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
  }

  setData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.address !== undefined) this.address = data.address;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;

    this.events.emit('buyer:changed', { buyer: this.getData() });
  }

  getData(): IBuyer {
    return {
      payment: this.payment ?? null as any,
      address: this.address ?? '',
      email: this.email ?? '',
      phone: this.phone ?? ''
    } as IBuyer;
  }

  clear(): void {
    this.payment = null;
    this.address = null;
    this.email = null;
    this.phone = null;
    this.events.emit('buyer:cleared', {});
  }

  validate(): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!this.payment) errors.payment = 'Не выбран вид оплаты';
    if (!this.address || this.address.trim() === '') errors.address = 'Укажите адрес';
    if (!this.email || this.email.trim() === '') errors.email = 'Укажите email';
    if (!this.phone || this.phone.trim() === '') errors.phone = 'Укажите телефон';

    if (Object.keys(errors).length === 0) {
      this.events.emit('buyer:validated', { buyer: this.getData() });
    }

    return errors;
  }
}