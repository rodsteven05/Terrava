export const BRANCHES = ['Main Tagum', 'Panabo', 'Sto. Tomas', 'Davao City', 'Mati City', 'Digos City']

export const BRANCH_COORDINATES = {
  'Main Tagum': [7.3360, 125.6845],
  'Panabo': [7.4400, 125.8000],
  'Sto. Tomas': [7.2100, 125.6200],
  'Davao City': [7.0680, 125.6080],
  'Mati City': [6.9540, 126.2150],
  'Digos City': [6.7480, 125.3560],
}

export const BRANCH_ZOOM = 13

export function getBranch(listing) {
  if (listing.branch) return listing.branch
  const loc = (listing.location_text || '').toLowerCase()
  if (loc.includes('panabo')) return 'Panabo'
  if (loc.includes('sto. tomas') || loc.includes('sto tomas') || loc.includes('santo tomas')) return 'Sto. Tomas'
  if (loc.includes('davao city') || loc.includes('davao')) return 'Davao City'
  if (loc.includes('mati city') || loc.includes('mati')) return 'Mati City'
  if (loc.includes('digos city') || loc.includes('digos')) return 'Digos City'
  if (loc.includes('tagum')) return 'Main Tagum'
  return 'Other'
}
