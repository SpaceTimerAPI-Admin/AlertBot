// Placeholder: Add logic for mapping restaurants by location
export function getRestaurantsByLocation(location) {
  const data = {
    'Magic Kingdom': ['Cinderella’s Royal Table', 'Be Our Guest'],
    'EPCOT': ['Le Cellier', 'Space 220'],
    'Hollywood Studios': ['Sci-Fi Dine-In', '50’s Prime Time Café'],
    'Animal Kingdom': ['Tiffins', 'Yak & Yeti']
  };
  return data[location] || [];
}
