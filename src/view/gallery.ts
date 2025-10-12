import { Component } from "../components/base/Component";

interface GalleryData {
  items?: HTMLElement[];
}

export class Gallery extends Component<GalleryData> {
  catalogElement: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this.catalogElement = this.container;
  }

  setCatalog(items: HTMLElement[]) {
    this.catalogElement.innerHTML = '';
    items.forEach(item => this.catalogElement.appendChild(item));
  }

  render(data: GalleryData): HTMLElement {
    if (data.items) {
      this.setCatalog(data.items);
    }
    return this.container;
  }
}