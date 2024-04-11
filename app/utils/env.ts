export type WindowEnv = {
  WALLETCONNECT_PROJECT_ID: string | undefined;
};

export function getWindowEnv(window: any) {
  return window.ENV as WindowEnv;
}
