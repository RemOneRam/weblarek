import { Component } from "../components/base/Component";

export class Form<T> extends Component<T> {
  protected container: HTMLFormElement;
  protected errors: HTMLElement | null;

  constructor(container: HTMLFormElement) {
    super(container);
    this.container = container;
    this.errors = this.container.querySelector(".form__errors");
  }

  protected setErrors(messages: string[]) {
    if (this.errors) {
      this.errors.textContent = messages.join(", ");
    }
  }

  protected clearErrors() {
    if (this.errors) {
      this.errors.textContent = "";
    }
  }
}
