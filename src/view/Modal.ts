import { EventEmitter } from '../components/base/Events';

/**
 * Modal component - самостоятельный компонент без наследников.
 * Управляет видимостью модального окна через модификатор 'modal_active'.
 */
export class Modal {
  private container: HTMLElement;
  private modalElement: HTMLElement | null;
  private contentElement: HTMLElement | null;
  private closeButton: HTMLButtonElement | null;
  private emitter?: EventEmitter;

  constructor(container: HTMLElement, emitter?: EventEmitter) {
    this.container = container;
    this.emitter = emitter;

    this.modalElement = this.container.querySelector('.modal') as HTMLElement | null;
    this.contentElement = this.container.querySelector('.modal__content') as HTMLElement | null;
    this.closeButton = this.container.querySelector('.modal__close') as HTMLButtonElement | null;

    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    if (this.modalElement) {
      this.modalElement.addEventListener('click', (evt) => {
        if (evt.target === this.modalElement) this.close();
      });
    }
  }

  open(content: HTMLElement): void {
    if (!this.modalElement || !this.contentElement) return;
    this.setContent(content);
    this.modalElement.classList.add('modal_active');
    this.emitter?.emit('modal:opened', {});
  }

  close(): void {
    if (!this.modalElement) return;
    this.modalElement.classList.remove('modal_active');
    if (this.contentElement) this.contentElement.innerHTML = '';
    this.emitter?.emit('modal:closed', {});
  }

  setContent(content: HTMLElement): void {
    if (!this.contentElement) return;
    this.contentElement.innerHTML = '';
    this.contentElement.appendChild(content);
  }

  render(): HTMLElement {
    return this.container;
  }
}