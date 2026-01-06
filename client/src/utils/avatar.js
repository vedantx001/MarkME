// Centralized avatar builder (DiceBear)

export function buildGenderAvatarUrl({ name, gender } = {}) {
  const safeName = String(name || 'User').trim() || 'User';
  const normalizedGender = String(gender || '').toUpperCase();

  // Use gender in seed so MALE/FEMALE render different avatars for same name.
  const seed = normalizedGender ? `${normalizedGender}-${safeName}` : safeName;

  // IMPORTANT:
  // Changing only the seed does NOT guarantee a "male-looking" or "female-looking" avatar.
  // To make the result reliably match gender, we constrain Avataaars options.
  // Options reference: https://www.dicebear.com/styles/avataaars/

  const baseUrl = 'https://api.dicebear.com/9.x/avataaars/svg';
  const params = new URLSearchParams({ seed });

  if (normalizedGender === 'MALE') {
    // Bias towards short hair + facial hair.
    params.set('top', [
      'shortFlat',
      'shortRound',
      'shortWaved',
      'theCaesar',
      'theCaesarAndSidePart',
      'shavedSides',
      'sides',
    ].join(','));
    params.set('facialHairProbability', '100');
    params.set('facialHair', ['beardLight', 'beardMedium', 'moustacheFancy', 'moustacheMagnum'].join(','));
  } else if (normalizedGender === 'FEMALE') {
    // Bias towards longer hair + no facial hair.
    params.set('top', [
      'longButNotTooLong',
      'bigHair',
      'bun',
      'curly',
      'straight01',
      'straight02',
      'straightAndStrand',
      'miaWallace',
      'bob',
    ].join(','));
    params.set('facialHairProbability', '0');
  }

  return `${baseUrl}?${params.toString()}`;
}
