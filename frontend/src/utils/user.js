/** Compose a display name from first/last name fields. */
export function userDisplayName(user) {
  if (!user) return '';
  const parts = [user.first_name, user.last_name].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return user.name || 'Traveler';
}

/** First letter for avatar initials. */
export function userInitial(user) {
  const name = userDisplayName(user);
  return name[0]?.toUpperCase() ?? '?';
}

/** First name only, for greetings. */
export function userFirstName(user) {
  if (!user) return 'Traveler';
  return user.first_name || userDisplayName(user).split(' ')[0] || 'Traveler';
}
