const KEY = "rg_theater_subscribed";

export function isSubscribed(): boolean {
  return localStorage.getItem(KEY) === "true";
}

export function subscribe() {
  localStorage.setItem(KEY, "true");
}

export function unsubscribe() {
  localStorage.removeItem(KEY);
}
