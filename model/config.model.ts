export interface AppConfig {
  environment: "development" | "production";
  gitmentOAuth: {
    clientId: string;
    clientSecret: string;
    repo: string;
  };
}
