import { Form } from "./Form";
import { EventEmitter } from "../components/base/Events";

interface IContactForm {
  email: string;
  phone: string;
}

export class ContactForm extends Form<IContactForm> {
  protected emailInput: HTMLInputElement | null;
  protected phoneInput: HTMLInputElement | null;
  private events: EventEmitter;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    super(container);
    this.events = events;

    this.emailInput = container.querySelector('input[name="email"]');
    this.phoneInput = container.querySelector('input[name="phone"]');

    this.phoneInput?.setAttribute('placeholder', '+7 (9');

    container.addEventListener("submit", (e) => {
      e.preventDefault();
      events.emit("order:submit", {
        data: {
          email: this.emailInput?.value || "",
          phone: this.phoneInput?.value || "",
        },
      });
    });

    this.emailInput?.addEventListener("input", () => this.emitChange());
    this.phoneInput?.addEventListener("input", () => this.emitChange());
  }

  private emitChange() {
    this.events.emit("contact:change", {
      data: {
        email: this.emailInput?.value || "",
        phone: this.phoneInput?.value || "",
      },
    });
  }

  setEmail(value: string) {
    if (this.emailInput) {
      this.emailInput.value = value;
    }
  }

  setPhone(value: string) {
    if (this.phoneInput) {
      this.phoneInput.value = value;
    }
  }

  public setSubmitDisabled(disabled: boolean) {
    const submit = this.container.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    if (submit) submit.disabled = disabled;
  }

  public showErrors(messages: string[]) {
    this.setErrors(messages);
  }
}
