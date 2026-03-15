/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_AUTH_AUTHORITY: string;
  readonly VITE_AUTH_CLIENT_ID: string;
  readonly VITE_AUTH_REDIRECT_URI: string;
  readonly VITE_AUTH_POST_LOGOUT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// View Transition API
interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
}

interface Document {
  startViewTransition?: (callback: () => void) => ViewTransition;
}
