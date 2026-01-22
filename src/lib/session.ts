const USER_KEY = "rg_theater_user_email";

export function getUserEmail(): string | null {
  try {
    return localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getUserEmail();
}

export function logoutUser() {
  localStorage.removeItem(USER_KEY);
}
