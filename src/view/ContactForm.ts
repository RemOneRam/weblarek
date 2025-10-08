import { Form } from './Form';
import { EventEmitter } from '../components/base/Events';

/**
 * ContactForm - форма ввода email и телефона.
 * При успешной валидации эмитит 'order:submit'.
 */
export class ContactForm extends Form {
  private emailInput: HTMLInputElement | null;
  private phoneInput: HTMLInputElement | null;

  constructor(formElement: HTMLFormElement, emitter?: EventEmitter) {
    super(formElement, emitter);

    this.emailInput = this.formElement.querySelector('input[name="email"]') as HTMLInputElement | null;
    this.phoneInput = this.formElement.querySelector('input[name="phone"]') as HTMLInputElement | null;

    this.formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const errors = this.validate();
      if (Object.keys(errors).length) {
        this.clearErrors();
        Object.entries(errors).forEach(([f, m]) => this.setErrorMessage(f, m));
        return;
      }

      const data = {
        email: this.emailInput?.value ?? '',
        phone: this.phoneInput?.value ?? ''
      };

      this.emitter?.emit('order:submit', { data });
    });
  }

  setEmail(value: string): void {
    if (this.emailInput) this.emailInput.value = value;
  }

  setPhone(value: string): void {
    if (this.phoneInput) this.phoneInput.value = value;
  }

  validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    const email = this.emailInput?.value ?? '';
    const phone = this.phoneInput?.value ?? '';

    if (!email.trim()) errors.email = 'Укажите email';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Неверный формат email';

    if (!phone.trim()) errors.phone = 'Укажите телефон';
    else if (!/^\+?\d[\d\s()-]{4,}$/.test(phone)) errors.phone = 'Неверный формат телефона';

    return errors;
  }
}