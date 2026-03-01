type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

type RequestConfig = {
  baseURL?: string;
  withCredentials?: boolean;
  headers: Record<string, string>;
  method?: Method;
};

type Interceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

export interface AxiosResponse<T> {
  data: T;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly data: unknown;

  constructor(status: number, data: unknown) {
    super(`Request failed (${status})`);
    this.status = status;
    this.data = data;
  }
}

class AxiosLike {
  private readonly baseURL: string;
  private readonly withCredentials: boolean;
  private requestInterceptor: Interceptor | null = null;

  public interceptors = {
    request: {
      use: (handler: Interceptor) => {
        this.requestInterceptor = handler;
      },
    },
  };

  constructor(config: { baseURL?: string; withCredentials?: boolean }) { 
    this.baseURL = config.baseURL ?? '';
    this.withCredentials = config.withCredentials ?? false;
  }

  async get<T>(url: string): Promise<AxiosResponse<T>> {
    return this.request<T>('get', url);
  }

  async post<T>(url: string, body?: unknown): Promise<AxiosResponse<T>> {
    return this.request<T>('post', url, body);
  }

  private async request<T>(method: Method, url: string, body?: unknown): Promise<AxiosResponse<T>> {
    let config: RequestConfig = { baseURL: this.baseURL, withCredentials: this.withCredentials, headers: {}, method };
    if (this.requestInterceptor) {
      config = await this.requestInterceptor(config);
    }

    const targetUrl = `${this.baseURL}${url}`;

    try {
      const response = await this.fetchJson(targetUrl, method, config, body);
      return { data: (await response.json()) as T };
    } catch (error) {
      if (this.shouldRetryWithHttp(error, targetUrl)) {
        const insecureUrl = targetUrl.replace('http://localhost', 'http://localhost');
        const response = await this.fetchJson(insecureUrl, method, config, body);
        return { data: (await response.json()) as T };
      }

      throw error;
    }
  }

  private async fetchJson(url: string, method: Method, config: RequestConfig, body?: unknown): Promise<Response> {
    const response = await fetch(url, {
      method: method.toUpperCase(),
      credentials: config.withCredentials ? 'include' : 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new HttpError(response.status, await this.tryParseBody(response));
    }

    return response;
  }

  private async tryParseBody(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private shouldRetryWithHttp(error: unknown, requestUrl: string): boolean {
    if (!(error instanceof TypeError)) {
      return false;
    }

    return requestUrl.startsWith('http://localhost');
  }
}

const axios = {
  create: (config: { baseURL?: string; withCredentials?: boolean }) => new AxiosLike(config),
};

export default axios;
