import { createClient } from "./api/v1/ClientFactory.ts";
import { RequestsAuthenticationRequest } from "./api/v1/StreamSinkClient.ts";

export interface AuthInfo {
  token: string;
}

export interface AuthHeader {
  Authorization: string;
}

const TOKEN_NAME = "jwt";

export default class AuthService {
  static login(user: RequestsAuthenticationRequest) {
    return new Promise<string>((resolve, reject) => {
      const client = createClient();
      client.auth.loginCreate(user).then(response => {
        const r = response.data as unknown as AuthInfo;
        if (r.token) {
          localStorage.removeItem(TOKEN_NAME);
          localStorage.setItem(TOKEN_NAME, r.token);
          return resolve(r.token);
        } else {
          return reject("token not found");
        }
      }).catch(reject);
    });
  }

  static logout() {
    localStorage.removeItem(TOKEN_NAME);
  }

  static getToken() {
    return localStorage.getItem(TOKEN_NAME);
  }

  static isLoggedIn() {
    return localStorage.getItem(TOKEN_NAME) !== null;
  }

  static signup(user: RequestsAuthenticationRequest) {
    const client = createClient();
    return client.auth.signupCreate(user);
  }

  static getAuthHeader(): AuthHeader | null {
    const token = localStorage.getItem(TOKEN_NAME);
    if (!token) {
      return null;
    }

    return { Authorization: 'Bearer ' + token };
  }
}