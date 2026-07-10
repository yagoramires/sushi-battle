const KEY = 'sushi-battle-session';
export const saveSession = (s) => localStorage.setItem(KEY, JSON.stringify(s));
export const loadSession = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
};
export const clearSession = () => localStorage.removeItem(KEY);
