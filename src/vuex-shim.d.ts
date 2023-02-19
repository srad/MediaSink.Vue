import { Store } from 'vuex';
import { ComponentCustomProperties } from 'vue';
import { ChannelResponse } from '@/services/api/v1/channelApi';
import { JobResponse } from '@/services/api/v1/jobApi';

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
