import { Store } from 'vuex';
import { ChannelResponse } from '@/services/api/v1/channelApi';

declare module '@vue/runtime-core' {
  // declare your own store states
  interface State {
    channels: ChannelResponse[];
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
