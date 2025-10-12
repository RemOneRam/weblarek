import { Form } from './Form';
import { EventEmitter } from '../components/base/Events';

interface IPaymentForm {
  payment: string;
  address: string;
}

export class PaymentForm extends Form<IPaymentForm> {
  protected paymentButtons: HTMLButtonElement[];
  protected addressInput: HTMLInputElement | null;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    super(container);

    this.paymentButtons = Array.from(container.querySelectorAll('button[name]')) as HTMLButtonElement[];
    this.addressInput = container.querySelector('input[name="address"]');

    this.paymentButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        events.emit('payment:change', { payment: button.name });
      });
    });

    this.addressInput?.addEventListener('input', () => {});
  }

  setPayment(value: string) {
    this.paymentButtons.forEach(button => {
      // использую модификатор из ТЗ button_alt-active или button_alt-active? ТЗ говорил button_alt-active
      button.classList.toggle('button_alt-active', button.name === value);
    });
  }

  setAddress(value: string) {
    if (this.addressInput) {
      this.addressInput.value = value;
    }
  }
}