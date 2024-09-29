import { DatabaseJob as JobData, DatabaseJob, DatabaseJobOrder, DatabaseJobStatus, DatabaseRecording } from '../../services/api/v1/StreamSinkClient.ts';
import { Module } from 'vuex';
import { createClient } from '../../services/api/v1/ClientFactory.ts';
import { State } from '../index.ts';
import { JobMutation } from './job.ts';
import { ToastMutation } from './toast.ts';

export interface RecordingState {
}

export const RecordingAction = {
  Destroy: 'recording/destroy',
};

const _action = {
  Destroy: 'destroy'
};

const _mutation = {};

export const RecordingMutation = {};

export const module: Module<RecordingState, State> = {
  namespaced: true,
  state(): RecordingState {
    return {};
  },
  getters: {},
  actions: {},
  mutations: {}
};
