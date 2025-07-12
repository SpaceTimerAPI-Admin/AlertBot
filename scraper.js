export async function getRestaurantsByLocation(location) {
  const sample = {
    "Magic Kingdom": [{ id: "cinderella-table", name: "Cinderella's Royal Table" }],
    "EPCOT": [{ id: "space-220", name: "Space 220" }],
    "Hollywood Studios": [{ id: "sci-fi-dine", name: "Sci-Fi Dine-In Theater" }],
    "Animal Kingdom": [{ id: "tusker-house", name: "Tusker House" }],
    "Disney Springs": [{ id: "boathouse", name: "The Boathouse" }],
    "Contemporary Resort": [{ id: "california-grill", name: "California Grill" }],
    "Grand Floridian": [{ id: "citricos", name: "Citricos" }],
    "Polynesian": [{ id: "ohana", name: "Ohana" }]
  };
  return sample[location] || [];
}

export async function watchForAvailability(restaurantId, date, meal) {
  // Real Playwright scraping would happen here
}
