import { createClient } from "./api/v1/ClientFactory";
import { type RequestsAuthenticationRequest } from "./api/v1/StreamSinkClient";
import { useAuthStore } from "../stores/auth";

export interface AuthInfo {
  token: string;
}

export interface AuthHeader {
  Authorization: string;
}

const clientBuilder = () => {
  const authStore = useAuthStore();
  return createClient(authStore.getToken, window.APP_APIURL);
};

export default class AuthService {
  static login(user: RequestsAuthenticationRequest) {
    return new Promise<string>((resolve, reject) => {
      const client = clientBuilder();
      client.auth
        .loginCreate(user)
        .then((response) => {
          const authStore = useAuthStore();
          const r = response as unknown as AuthInfo;
          if (r.token) {
            return resolve(r.token);
          } else {
            return reject("token not found");
          }
        })
        .catch(reject);
    });
  }

  static logout() {
  }

  static signup(user: RequestsAuthenticationRequest) {
    const client = clientBuilder();
    return client.auth.signupCreate(user);
  }

}
