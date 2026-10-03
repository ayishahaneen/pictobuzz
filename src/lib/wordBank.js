const WORD_CATEGORIES = [
  'All Categories',
  'Animals',
  'Everyday Objects',
  'Food & Drinks',
  'Vehicles',
  'Nature',
  'Places',
  'Sports',
  'Jobs & Professions',
  'Movies & Pop Culture',
  'Household Items',
  'Technology'
];

const WORD_BANK = [
  // Animals
  { word: 'Elephant', category: 'Animals', difficulty: 'easy', hints: ['Large mammal', 'Has a trunk'] },
  { word: 'Cat', category: 'Animals', difficulty: 'easy', hints: ['Pet', 'Meows'] },
  { word: 'Dog', category: 'Animals', difficulty: 'easy', hints: ['Pet', 'Barks'] },
  { word: 'Lion', category: 'Animals', difficulty: 'easy', hints: ['King of the jungle', 'Has a mane'] },
  { word: 'Duck', category: 'Animals', difficulty: 'easy', hints: ['Swims in ponds', 'Quacks'] },
  { word: 'Bird', category: 'Animals', difficulty: 'easy', hints: ['Has wings', 'Can fly'] },
  { word: 'Fish', category: 'Animals', difficulty: 'easy', hints: ['Lives in water', 'Has gills'] },
  { word: 'Monkey', category: 'Animals', difficulty: 'easy', hints: ['Loves bananas', 'Climbs trees'] },
  { word: 'Frog', category: 'Animals', difficulty: 'easy', hints: ['Green amphibian', 'Hops'] },
  { word: 'Snake', category: 'Animals', difficulty: 'easy', hints: ['Reptile', 'Slithers'] },
  { word: 'Giraffe', category: 'Animals', difficulty: 'easy', hints: ['Tall animal', 'Long neck'] },
  { word: 'Penguin', category: 'Animals', difficulty: 'easy', hints: ['Flightless bird', 'Waddles on ice'] },
  { word: 'Butterfly', category: 'Animals', difficulty: 'easy', hints: ['Insect', 'Colorful wings'] },
  { word: 'Rabbit', category: 'Animals', difficulty: 'easy', hints: ['Long ears', 'Eats carrots'] },
  { word: 'Octopus', category: 'Animals', difficulty: 'medium', hints: ['Sea creature', 'Eight tentacles'] },
  { word: 'Kangaroo', category: 'Animals', difficulty: 'medium', hints: ['Australian', 'Has a pouch'] },

  // Vehicles
  { word: 'Bicycle', category: 'Vehicles', difficulty: 'easy', hints: ['Two wheels', 'Pedals'] },
  { word: 'Car', category: 'Vehicles', difficulty: 'easy', hints: ['Four wheels', 'Driven on roads'] },
  { word: 'Airplane', category: 'Vehicles', difficulty: 'easy', hints: ['Flies in the sky', 'Has wings'] },
  { word: 'Rocket', category: 'Vehicles', difficulty: 'easy', hints: ['Goes to space', 'Flames at bottom'] },
  { word: 'Boat', category: 'Vehicles', difficulty: 'easy', hints: ['Floats on water', 'Sail or motor'] },
  { word: 'Train', category: 'Vehicles', difficulty: 'easy', hints: ['Runs on tracks', 'Choo-choo'] },
  { word: 'Helicopter', category: 'Vehicles', difficulty: 'medium', hints: ['Rotary blades', 'Hovers'] },
  { word: 'Submarine', category: 'Vehicles', difficulty: 'medium', hints: ['Underwater vessel', 'Periscope'] },

  // Food & Drinks
  { word: 'Pizza', category: 'Food & Drinks', difficulty: 'easy', hints: ['Cheesy slice', 'Crust and toppings'] },
  { word: 'Burger', category: 'Food & Drinks', difficulty: 'easy', hints: ['Bun, patty, lettuce', 'Fast food'] },
  { word: 'Ice Cream', category: 'Food & Drinks', difficulty: 'easy', hints: ['Cold sweet treat', 'In a cone'] },
  { word: 'Apple', category: 'Food & Drinks', difficulty: 'easy', hints: ['Fruit', 'Red or green, has a stem'] },
  { word: 'Banana', category: 'Food & Drinks', difficulty: 'easy', hints: ['Yellow fruit', 'Peel to eat'] },
  { word: 'Cake', category: 'Food & Drinks', difficulty: 'easy', hints: ['Birthday dessert', 'Candles on top'] },
  { word: 'Coffee', category: 'Food & Drinks', difficulty: 'easy', hints: ['Morning brew', 'Mug with steam'] },
  { word: 'Donut', category: 'Food & Drinks', difficulty: 'easy', hints: ['Ring pastry with hole', 'Sprinkles'] },

  // Nature
  { word: 'Mountain', category: 'Nature', difficulty: 'easy', hints: ['High peak', 'Snow-capped top'] },
  { word: 'Tree', category: 'Nature', difficulty: 'easy', hints: ['Trunk and leaves', 'Grows in forests'] },
  { word: 'Sun', category: 'Nature', difficulty: 'easy', hints: ['In the sky', 'Shines bright'] },
  { word: 'Volcano', category: 'Nature', difficulty: 'easy', hints: ['Mountain with lava', 'Erupts'] },
  { word: 'Flower', category: 'Nature', difficulty: 'easy', hints: ['Petals and stem', 'Blooms in spring'] },
  { word: 'Cloud', category: 'Nature', difficulty: 'easy', hints: ['Fluffy in sky', 'Brings rain'] },
  { word: 'Rainbow', category: 'Nature', difficulty: 'easy', hints: ['Arch of colors in sky', 'After rain'] },

  // Objects & Technology
  { word: 'Guitar', category: 'Everyday Objects', difficulty: 'easy', hints: ['Musical instrument', 'Strings'] },
  { word: 'Clock', category: 'Everyday Objects', difficulty: 'easy', hints: ['Tells time', 'Hour and minute hands'] },
  { word: 'Umbrella', category: 'Everyday Objects', difficulty: 'easy', hints: ['Keeps you dry', 'Opens in rain'] },
  { word: 'Scissors', category: 'Everyday Objects', difficulty: 'easy', hints: ['Cuts paper', 'Two blades'] },
  { word: 'Robot', category: 'Technology', difficulty: 'easy', hints: ['Mechanical entity', 'Antenna and metal body'] },
  { word: 'Camera', category: 'Technology', difficulty: 'easy', hints: ['Takes photos', 'Lens and flash'] },
  { word: 'Laptop', category: 'Technology', difficulty: 'easy', hints: ['Portable computer', 'Keyboard and screen'] },
  { word: 'House', category: 'Places', difficulty: 'easy', hints: ['Building to live in', 'Roof, door, and windows'] },
  { word: 'Castle', category: 'Places', difficulty: 'easy', hints: ['Fortress', 'Towers and stone walls'] }
];

function getWordChoices(category, difficulty, excludeWords = []) {
  let pool = WORD_BANK.filter(w => !excludeWords.includes(w.word));
  
  if (category && category !== 'All Categories') {
    const catPool = pool.filter(w => w.category.toLowerCase() === category.toLowerCase());
    if (catPool.length >= 3) {
      pool = catPool;
    }
  }

  if (difficulty && difficulty !== 'mixed') {
    const diffPool = pool.filter(w => w.difficulty === difficulty);
    if (diffPool.length >= 3) {
      pool = diffPool;
    }
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3).map(w => w.word);

  if (selected.length < 3) {
    const defaults = ['Elephant', 'Bicycle', 'Mountain', 'Guitar', 'Rocket', 'Pizza'];
    for (const d of defaults) {
      if (!selected.includes(d)) selected.push(d);
      if (selected.length === 3) break;
    }
  }

  return selected;
}

module.exports = {
  WORD_CATEGORIES,
  WORD_BANK,
  getWordChoices
};
