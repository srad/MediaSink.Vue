import { Store } from 'vuex';
import { ComponentCustomProperties } from 'vue';

declare module '@vue/runtime-core' {
  // declare your own store states
  interface State {
    channels: ChannelResponse[];
    jobs: JobResponse[];
    loggedIn: boolean;
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
