import { EventEmitter } from "../components/base/Events";

export class PaymentForm {
  private form: HTMLFormElement;
  private events: EventEmitter;
  private addressInput: HTMLInputElement | null;
  private buttons: NodeListOf<HTMLButtonElement>;
  private nextBtn: HTMLButtonElement | null;

  private selectedPayment: string | null = null;

  constructor(form: HTMLFormElement, events: EventEmitter) {
    this.form = form;
    this.events = events;
    this.addressInput = this.form.querySelector<HTMLInputElement>('input[name="address"]');
    this.buttons = this.form.querySelectorAll<HTMLButtonElement>(".button_alt");
    this.nextBtn = this.form.querySelector<HTMLButtonElement>('button[type="submit"]');

    this.buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.selectPayment(btn);
      });
    });

    this.addressInput?.addEventListener("input", () => {
      this.emitChange();
    });

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const address = this.addressInput?.value.trim() ?? "";
      this.events.emit("order:step1:submit", {
        data: {
          payment: this.selectedPayment,
          address,
        },
      });
    });
  }

  private selectPayment(btn: HTMLButtonElement) {
    this.buttons.forEach((b) => b.classList.remove("button_alt-active"));

    btn.classList.add("button_alt-active");
    this.selectedPayment = btn.textContent?.trim() || null;
    this.emitChange();
  }

  private emitChange() {
    const address = this.addressInput?.value.trim() ?? "";
    this.events.emit("payment:change", {
      payment: this.selectedPayment,
      address,
    });
  }

  setSubmitDisabled(disabled: boolean) {
    if (this.nextBtn) {
      this.nextBtn.disabled = disabled;
    }
  }

  setErrors(messages: string[]) {
    const errors = this.form.querySelector('.form__errors') as HTMLElement | null;
    if (errors) errors.textContent = messages.join(', ');
  }
}
