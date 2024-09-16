import { State } from '../index.ts';
import { Module } from 'vuex';

export interface ToastState {
  toasts: Toast[];
}

export interface Toast {
  title: string;
  message: string;
  hide: boolean;
  created: Date;
  countdown: number;
}

export const ToastMutation = {
  Add: 'toast/add',
  Destroy: 'toast/destroy',
  Hide: 'toast/hide',
};

const _mutation = {
  Add: 'add',
  Destroy: 'destroy',
  Hide: 'hide',
};

export const module: Module<ToastState, State> = {
  namespaced: true,
  state: (): ToastState => ({
    toasts: [],
  }),
  actions: {},
  mutations: {
    [_mutation.Add](state: ToastState, info: { title: string, message: string }) {
      const toast: Toast = { ...info, hide: false, created: new Date(), countdown: 100 };
      const i = state.toasts.push(toast) - 1;

      // The animation can also be implemented with pure CSS, but that free us from this state update logic.
      const toastDisplayDurationMs = 3000;
      const id = setInterval(() => {
        const dtMS = ((new Date()).getTime() - toast.created.getTime());
        state.toasts[i].countdown = 100 - (dtMS / toastDisplayDurationMs * 100);
        if (state.toasts[i].countdown <= 0) {
          clearInterval(id);
          state.toasts[i].hide = true;
        }
      }, toastDisplayDurationMs / 10);
    },
    [_mutation.Destroy](state: ToastState, toast: Toast) {
      const i = state.toasts.findIndex(x => x === toast);
      if (i !== -1) {
        state.toasts.splice(i, 1);
      }
    },
    [_mutation.Hide](state: ToastState, toast: Toast) {
      const i = state.toasts.findIndex(x => x === toast);
      if (i !== -1) {
        state.toasts[i].hide = true;
      }
    },
  },
  getters: {
    getToast(state: ToastState): Toast[] {
      return state.toasts;
    },
  }
};
