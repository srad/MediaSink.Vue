import { createStore, Store } from 'vuex';
import { ChannelState, module as channelModule } from './modules/channel.ts';
import { module as toastModule, ToastMutation, ToastState } from './modules/toast.ts';
import { RecordingState, module as recordingModule } from './modules/recording.ts';
import { JobState, module as jobModule } from './modules/job.ts';
import { AuthState, module as authModule } from './modules/auth.ts';
import { InjectionKey } from 'vue';
import { useStore as baseUseStore } from 'vuex';

export interface State {
  channel: ChannelState;
  job: JobState;
  toast: ToastState;
  auth: AuthState;
  recording: RecordingState;
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  modules: {
    recording: recordingModule,
    channel: channelModule,
    job: jobModule,
    toast: toastModule,
    auth: authModule,
  },
  actions: {
    error({ commit }, message: string) {
      commit(ToastMutation.Add, { title: 'Error', message: message });
    },
  },
});

export const useStore = function () {
  return baseUseStore(key);
};
