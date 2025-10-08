import { EventEmitter } from '../components/base/Events';

/**
 * Form - базовый класс для форм (не хранит данных)
 * Все слушатели устанавливаются в конструкторе.
 */
export class Form {
  protected formElement: HTMLFormElement;
  protected submitButton: HTMLButtonElement | null;
  protected errorsElement: HTMLElement | null;
  protected emitter?: EventEmitter;

  constructor(formElement: HTMLFormElement, emitter?: EventEmitter) {
    this.formElement = formElement;
    this.emitter = emitter;

    this.submitButton = this.formElement.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    this.errorsElement = this.formElement.querySelector('.form__errors') as HTMLElement | null;

    this.formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const data = new FormData(this.formElement);
      this.emitter?.emit('form:submit', { form: this.formElement, data });
    });
  }

  onSubmit(handler: (data: object) => void): void {
    this.formElement.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(this.formElement);
        const formData = Object.fromEntries(data.entries());
        handler(formData); 
    });
}

  setErrorMessage(field: string, message: string): void {
    if (!this.errorsElement) return;
    const el = document.createElement('div');
    el.className = 'form__error';
    el.dataset.field = field;
    el.textContent = `${field}: ${message}`;
    this.errorsElement.appendChild(el);
  }

  clearErrors(): void {
    if (this.errorsElement) this.errorsElement.innerHTML = '';
  }

  render(): HTMLElement {
    return this.formElement;
  }
}