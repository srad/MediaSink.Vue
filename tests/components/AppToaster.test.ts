import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import AppToaster from "../../src/components/AppToaster.vue";
import { Toast, ToastKind, useToastStore } from "../../src/stores/toast";
import { createPinia, setActivePinia } from "pinia";

describe("AppToaster", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const store = useToastStore();
    store.$reset(); // Reset the store before each test
  });

  const toasts: Toast[] = [
    {
      id: 1,
      created: new Date(),
      title: "Info Toast",
      message: "This is an info toast",
      hide: false,
      countdown: 50,
      kind: ToastKind.Info, // Use the mocked ToastKind enum
    },
    {
      id: 2,
      created: new Date(),
      title: "Success Toast",
      message: "This is a success toast",
      hide: false,
      countdown: 70,
      kind: ToastKind.Success, // Use the mocked ToastKind enum
    },
  ];

  it("hides the toast when close button is clicked", async () => {
    // Mount the component with the mocked store
    const wrapper = mount(AppToaster, {
      props: {
        toasts,
      },
    });

    // Find and click the close button for the first toast
    const closeButton = wrapper.findAll(".btn-close").at(0);
    if (closeButton) {
      await closeButton.trigger("click");
    }

    const el = wrapper.find(".btn-close");

    // Check if hide was called with the correct toast object
    expect(el).toBeUndefined();
  });

  it("applies the correct toast kind classes", () => {
    const wrapper = mount(AppToaster, {
      props: {
        toasts,
      },
    });

    // Check if each toast has the correct class based on its kind
    toasts.forEach((toast, index) => {
      const toastElement = wrapper.findAll(".line-indicator").at(index);
      const expectedClass = `bg-${toast.kind.toLowerCase()}`;
      expect(toastElement?.classes()).toContain(expectedClass);
    });
  });
});
