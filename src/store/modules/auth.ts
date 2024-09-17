import AuthService from '../../services/auth.service.ts';
import { RequestsAuthenticationRequest } from '../../services/api/v1/StreamSinkClient.ts';
import { Commit, Module } from 'vuex';
import { State } from '../index.ts';

export interface AuthState {
  loggedIn: boolean;
}

export const AuthAction = {
  Login: 'auth/login',
  Logout: 'auth/logout',
  Register: 'auth/register',
};

const _action = {
  Login: 'login',
  Logout: 'logout',
  Register: 'register',
};

export const AuthMutation = {
  LoginSuccess: 'auth/login-success',
  LoginFailure: 'auth/login-failure',
  Login: 'auth/login',
  Logout: 'auth/logout',
  RegisterSuccess: 'auth/register-success',
  RegisterFailure: 'auth/register-failure',
};

const _mutation = {
  LoginSuccess: 'login-success',
  LoginFailure: 'login-failure',
  Login: 'login',
  Logout: 'logout',
  RegisterSuccess: 'register-success',
  RegisterFailure: 'register-failure',
};

const token = AuthService.getToken();

export const module: Module<AuthState, State> = {
  namespaced: true,
  state: (): AuthState => ({
    loggedIn: token !== null,
  }),
  actions: {
    async [_action.Login]({ commit }: { commit: Commit }, user: RequestsAuthenticationRequest) {
      return new Promise(async (resolve, reject) => {
        AuthService.login(user).then(token => {
          commit(_mutation.LoginSuccess);
          resolve(token);
        }).catch(error => {
          commit(_mutation.LoginFailure);
          return reject(error);
        });
      });
    },
    [_action.Logout]({ commit }: { commit: Commit }) {
      AuthService.logout();
      commit(_mutation.Logout);
    },
    async [_action.Register]({ commit }: { commit: Commit }, user: RequestsAuthenticationRequest) {
      try {
        let response = await AuthService.signup(user);
        commit(_mutation.RegisterSuccess);
        return Promise.resolve(response.data);
      } catch (error) {
        commit(_mutation.RegisterFailure);
        return Promise.reject(error);
      }
    },
  },
  mutations: {
    [_mutation.LoginSuccess](state: AuthState) {
      state.loggedIn = true;
    },
    [_mutation.LoginFailure](state: AuthState) {
      state.loggedIn = false;
    },
    [_mutation.Login](state: AuthState) {
      state.loggedIn = true;
    },
    [_mutation.Logout](state: AuthState) {
      state.loggedIn = false;
    },
    [_mutation.RegisterSuccess](state: AuthState) {
      state.loggedIn = false;
    },
    [_mutation.RegisterFailure](state: AuthState) {
      state.loggedIn = false;
    },
  },
  getters: {
    isLoggedIn(state: AuthState): boolean {
      return state.loggedIn;
    }
  }
};
