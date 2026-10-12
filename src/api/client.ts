// src/api/client.ts
import { useAuthStore } from "@/auth/authStore";
import { tokenStore } from "@/auth/secureStore";
import { env } from "@/config/env";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  error: null;
  meta?: { timestamp: string };
};

export type ApiError = {
  success: false;
  data: null;
  error: { code: string; message: string; details?: unknown };
  meta?: { timestamp: string };
};

export class ApiRequestError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ─── DEV LOGGING ──────────────────────────────────────────────────────────
const DEV = __DEV__; // true in dev, false in production

function ts(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

/** Redact sensitive fields before logging. */
function redact(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const SENSITIVE = [
    "password",
    "otp",
    "code",
    "refreshToken",
    "accessToken",
    "idNumber",
  ];
  const clone: any = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(clone)) {
    if (SENSITIVE.includes(key)) {
      clone[key] = "••••";
    } else if (typeof clone[key] === "object") {
      clone[key] = redact(clone[key]);
    }
  }
  return clone;
}

function logApi(icon: string, method: string, url: string, extra?: any) {
  if (!DEV) return;
  const line = `${icon} [${ts()}] ${method.toUpperCase()} ${url}`;
  if (extra !== undefined) {
    // eslint-disable-next-line no-console
    console.log(line, JSON.stringify(extra, null, 2).slice(0, 2000));
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}
// ──────────────────────────────────────────────────────────────────────────

export const api: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ── REQUEST LOGGING + AUTH HEADER ─────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (DEV) {
    const fullUrl = `${config.baseURL ?? ""}${config.url ?? ""}`;
    const hasBody = config.data !== undefined && config.data !== null;
    logApi(
      "➡️ ",
      config.method ?? "GET",
      fullUrl,
      hasBody ? redact(config.data) : undefined,
    );
  }

  return config;
});

// ── RESPONSE LOGGING ──────────────────────────────────────────────────────
type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = await tokenStore.getRefresh();
    if (!refresh)
      throw new ApiRequestError(401, "NO_REFRESH_TOKEN", "Not authenticated");

    if (DEV) {
      // eslint-disable-next-line no-console
      console.log(`🔄 [${ts()}] Refreshing access token...`);
    }

    const resp = await axios.post<
      ApiSuccess<{ accessToken: string; refreshToken: string }>
    >(
      `${env.API_BASE_URL}/auth/token/refresh`,
      { refreshToken: refresh },
      { timeout: env.TIMEOUT_MS },
    );

    const { accessToken, refreshToken } = resp.data.data;
    await tokenStore.saveTokens(accessToken, refreshToken);
    useAuthStore.setState({ accessToken });

    if (DEV) {
      // eslint-disable-next-line no-console
      console.log(`✓ [${ts()}] Token refreshed`);
    }

    return accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (DEV) {
      const method = response.config.method ?? "GET";
      const url = `${response.config.baseURL ?? ""}${response.config.url ?? ""}`;
      logApi("✅ ", method, url, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const method = original?.method ?? "GET";
    const url = `${original?.baseURL ?? ""}${original?.url ?? ""}`;

    if (!error.response) {
      if (DEV) {
        // eslint-disable-next-line no-console
        console.log(
          `❌ [${ts()}] NETWORK ERROR ${method.toUpperCase()} ${url}`,
          error.message,
        );
      }
      throw new ApiRequestError(
        0,
        "NETWORK_ERROR",
        "Unable to reach the server. Check your connection.",
      );
    }

    const { status, data } = error.response;

    // 401 → try refresh once, then replay
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/token/refresh") &&
      !original.url?.includes("/auth/otp/")
    ) {
      original._retry = true;
      try {
        const newAccess = await refreshAccessToken();
        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${newAccess}`,
        };
        return api.request(original);
      } catch (refreshErr) {
        await useAuthStore.getState().logout();
        throw refreshErr instanceof ApiRequestError
          ? refreshErr
          : new ApiRequestError(401, "REFRESH_FAILED", "Session expired");
      }
    }

    // Non-401 → normalize error envelope
    const envelope = data as ApiError | undefined;
    const code = envelope?.error?.code ?? "UNKNOWN";
    const message = envelope?.error?.message ?? `Request failed (${status})`;

    if (DEV) {
      logApi(`❌ (${status})`, method, url, envelope?.error ?? data);
    }

    throw new ApiRequestError(status, code, message, envelope?.error?.details);
  },
);

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const r = await api.get<ApiSuccess<T>>(url, config);
  return r.data.data;
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const r = await api.post<ApiSuccess<T>>(url, body, config);
  return r.data.data;
}

export async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const r = await api.patch<ApiSuccess<T>>(url, body, config);
  return r.data.data;
}
