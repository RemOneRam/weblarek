import { Form } from "./Form";
import { EventEmitter } from "../components/base/Events";

interface IContactForm {
  email: string;
  phone: string;
}

export class ContactForm extends Form<IContactForm> {
  protected emailInput: HTMLInputElement | null;
  protected phoneInput: HTMLInputElement | null;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    super(container);

    this.emailInput = container.querySelector('input[name="email"]');
    this.phoneInput = container.querySelector('input[name="phone"]');

    container.addEventListener("submit", (e) => {
      e.preventDefault();
      events.emit("order:submit", {
        data: {
          email: this.emailInput?.value || "",
          phone: this.phoneInput?.value || "",
        },
      });
    });

    this.emailInput?.addEventListener("input", () => {});
    this.phoneInput?.addEventListener("input", () => {});
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
}
