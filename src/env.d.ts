/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JIRA_API_TOKEN: string;
  readonly VITE_JIRA_HOST: string;
  readonly VITE_JIRA_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
