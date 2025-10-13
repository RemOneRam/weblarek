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
    this.addressInput = this.form.querySelector<HTMLInputElement>(
      'input[name="address"]'
    );
    this.buttons = this.form.querySelectorAll<HTMLButtonElement>(".button_alt");
    this.nextBtn = this.form.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    );

    this.buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.selectPayment(btn);
      });
    });

    this.addressInput?.addEventListener("input", () => {
      this.updateButtonState();
      this.emitChange();
    });

    this.updateButtonState();
  }

  private selectPayment(btn: HTMLButtonElement) {
    this.buttons.forEach((b) => b.classList.remove("button_alt-active"));

    btn.classList.add("button_alt-active");
    this.selectedPayment = btn.textContent?.trim() || null;
    this.emitChange();
    this.updateButtonState();
  }

  private emitChange() {
    const address = this.addressInput?.value.trim() ?? "";
    this.events.emit("payment:change", {
      payment: this.selectedPayment,
      address,
    });
  }

  private updateButtonState() {
    const isReady = !!this.selectedPayment && !!this.addressInput?.value.trim();
    if (this.nextBtn) {
      this.nextBtn.disabled = !isReady;
    }
  }
}
