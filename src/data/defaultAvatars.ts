export const DEFAULT_FEMALE_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="90" stroke="%23020617" stroke-width="12"/><path d="M100 36c-18 0-32 14-32 32 0 14 8 26 20 30-22 8-36 28-36 52 0 3 2 5 5 5h86c3 0 5-2 5-5 0-24-14-44-36-52 12-4 20-16 20-30 0-18-14-32-32-32z" fill="%23020617"/><path d="M68 68c0 28 14 46 32 46s32-18 32-46c0-18-12-32-32-32S68 50 68 68z" fill="%23020617"/></svg>`;

export const DEFAULT_MALE_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="90" stroke="%23020617" stroke-width="12"/><path d="M100 40c-15 0-28 12-28 28 0 12 8 22 18 26-20 8-34 26-34 48 0 3 2 5 5 5h78c3 0 5-2 5-5 0-22-14-40-34-48 10-4 18-14 18-26 0-16-13-28-28-28z" fill="%23020617"/><polygon points="100,108 94,135 100,148 106,135" fill="%23020617"/><path d="M88 108l12 12 12-12" stroke="%23ffffff" stroke-width="3" fill="none"/></svg>`;

export const getDefaultAvatar = (gender: 'male' | 'female' | string): string => {
  return gender === 'female' ? DEFAULT_FEMALE_AVATAR : DEFAULT_MALE_AVATAR;
};
