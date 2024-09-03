import { Modal as ModalBootstrap } from 'bootstrap';

/**
 * TODO: In order for SSR to work replacements are needed for certain libraries.
 * This is only a wrapper for bootstrap right now.
 */
export default class Modal {
  private static element: { [key: string]: HTMLElement } = {};
  private id: string;
  private modalBootstrap: ModalBootstrap;

  constructor(element: HTMLElement) {
    let id = element.getAttribute('id');
    if (id === null) {
      id = `modal-${Modal.generateId()}`;
      element.setAttribute('id', id);
    }
    if (!Modal.element[id]) {
      Modal.element[id] = element;
    }
    this.id = id;
    this.modalBootstrap = new ModalBootstrap(element);
  }

  show() {
    //Modal.element[this.id].classList.add('show');
    this.modalBootstrap.show();
  }

  hide() {
    //Modal.element[this.id].classList.remove('show');
    this.modalBootstrap.hide();
  }

  static generateId(): string {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').slice(2, 10);
  }
}
