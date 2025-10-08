import { IBuyer} from '../../../types';
import { EventEmitter } from '../../base/Events';

export class Buyer {
    private payment: IBuyer['payment'] | null = null;
    private address: string | null = null;
    private email: string | null = null;
    private phone: string | null = null;
    private emitter?: EventEmitter;

    constructor(emitter?: EventEmitter) {
        this.emitter = emitter;
    }

    setData(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) this.payment = data.payment;
        if (data.address !== undefined) this.address = data.address;
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;

        this.emitter?.emit('buyer:changed', { buyer: this.getData() });
    }

    getData(): IBuyer {
        return {
            payment: this.payment as IBuyer['payment'],
            address: this.address as string,
            email: this.email as string,
            phone: this.phone as string,
        };
    }

    clear(): void {
        this.payment = null;
        this.address = null;
        this.email = null;
        this.phone = null;
        this.emitter?.emit('buyer:cleared', {});
    }

    validate(): Record<string, string> {
        const errors: Record<string, string> = {};
        if (!this.payment) errors.payment = 'Не выбран вид оплаты';
        if (!this.address || this.address.trim() === '') errors.address = 'Укажите адрес';
        if (!this.email || this.email.trim() === '') errors.email = 'Укажите email';
        if (!this.phone || this.phone.trim() === '') errors.phone = 'Укажите телефон';

        this.emitter?.emit('buyer:validated', { errors });
        return errors;
    }
}