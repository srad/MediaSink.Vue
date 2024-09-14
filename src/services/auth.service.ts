import { createClient } from "./api/v1/ClientFactory.ts";
import { RequestsAuthenticationRequest } from "./api/v1/StreamSinkClient.ts";

const client = createClient();

export interface AuthInfo {
  token: string;
}

export interface AuthHeader {
  Authorization: string;
}

export default class AuthService {
  static login(user: RequestsAuthenticationRequest): string {
    return client.auth.loginCreate(user).then(response => {
      const r = response.data as unknown as AuthInfo;
      if (r.token) {
        localStorage.setItem('token', r.token);
      }

      return r.token;
    });
  }

  static logout() {
    localStorage.removeItem('token');
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static isLoggedIn() {
    return AuthService.getToken() !== null;
  }

  static signup(user: RequestsAuthenticationRequest) {
    return client.auth.signupCreate(user);
  }

  static getAuthHeader(): AuthHeader | null {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    return { Authorization: 'Bearer ' + token };
  }
}