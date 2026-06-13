export const APP_STORAGE_KEYS = {
  users: 'sql-interface-users',
  activeUserId: 'sql-interface-active-user-id',
  sidebarCollapsed: 'sql-interface-sidebar-collapsed',
  theme: 'sql-interface-theme',
} as const;

export function clearAllAppStorage(): void {
  Object.values(APP_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
