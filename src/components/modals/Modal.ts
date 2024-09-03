export default class Modal {
  private static element: { [key: string]: HTMLElement } = {};

  constructor(element: HTMLElement) {
    let id = element.getAttribute('id');
    if (id === null) {
      id = `modal-${Modal.generateId()}`;
      element.setAttribute('id', id);
    }
    if (!Modal.element[id]) {
      Modal.element[id] = element;
    }
  }

  show() {

  }

  hide() {

  }

  static generateId(): string {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').slice(2, 10);
  }
}
