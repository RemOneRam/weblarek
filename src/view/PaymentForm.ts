import { Form } from './Form';
import { EventEmitter } from '../components/base/Events';

/**
 * PaymentForm - выбор способа оплаты и адреса.
 * Использует модификатор 'button_alt-active' для выделения кнопки выбранного варианта.
 */
export class PaymentForm extends Form {
  private paymentOptions: NodeListOf<HTMLInputElement>;
  private addressInput: HTMLInputElement | null;

  constructor(formElement: HTMLFormElement, emitter?: EventEmitter) {
    super(formElement, emitter);

    this.paymentOptions = this.formElement.querySelectorAll('input[name="payment"]') as NodeListOf<HTMLInputElement>;
    this.addressInput = this.formElement.querySelector('input[name="address"]') as HTMLInputElement | null;

    this.paymentOptions.forEach((opt) => {
      const btn = this.formElement.querySelector(`[data-payment="${opt.value}"]`) as HTMLElement | null;

      if (btn) {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          opt.checked = true;

          this.paymentOptions.forEach(o => {
            const b = this.formElement.querySelector(`[data-payment="${o.value}"]`);
            if (b) b.classList.remove('button_alt-active');
          });
          btn.classList.add('button_alt-active');

          this.emitter?.emit('payment:change', { payment: opt.value });
        });
      }

      opt.addEventListener('change', () => {
        this.paymentOptions.forEach(o => {
          const b = this.formElement.querySelector(`[data-payment="${o.value}"]`);
          if (b) b.classList.toggle('button_alt-active', o.checked);
        });
        this.emitter?.emit('payment:change', { payment: (opt as HTMLInputElement).value });
      });
    });
  }

  setPayment(value: string): void {
    this.paymentOptions.forEach(o => {
      o.checked = o.value === value;
      const b = this.formElement.querySelector(`[data-payment="${o.value}"]`);
      if (b) b.classList.toggle('button_alt-active', o.value === value);
    });
  }

  setAddress(value: string): void {
    if (this.addressInput) this.addressInput.value = value;
  }

  validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    const chosen = Array.from(this.paymentOptions).find(o => o.checked);
    if (!chosen) errors.payment = 'Не выбран вид оплаты';
    if (!this.addressInput || !this.addressInput.value.trim()) errors.address = 'Укажите адрес';
    return errors;
  }
}