# HBCU School Wiki — Master Schema

This schema defines the ideal structure for storing and displaying rich, editorialized school information for each HBCU program. It is intended for use in teams.json or any future school metadata file. All fields should be filled out for every school. Future sections (like "Influencers") are included for planned expansion.

---

## School Wiki Schema

```json
{
  "id": "alcorn",
  "exportId": "swacalc25",
  "name": "Alcorn State University",
  "shortName": "Alcorn",
  "bannerShort": "ASU",
  "mascot": "Braves",
  "motto": "Where Knowledge and Character Meet",
  "founded": 1871,
  "enrollment": 3700,
  "conference": "SWAC",
  "division": "East",
  "location": {
    "city": "Lorman",
    "state": "MS",
    "campusNickname": "The Reservation",
    "campusType": "Rural",
    "landmarkSpots": ["The Oakland Memorial Chapel", "The Golden Class Gate"],
    "coordinates": { "lat": 31.8767, "lng": -91.1384 }
  },
  "branding": {
    "colors": { "primary": "#5C068C", "secondary": "#FFD100", "accent": "#000000" },
    "colorsDescription": "Purple and Gold represents the royal heritage and excellence of the institution.",
    "logo": "/assets/swacalc.svg",
    "helmetLogo": "/assets/alcorn_helmet.svg",
    "secondaryLogo": "/assets/alcorn_brave_head.svg",
    "socialHandles": { "twitter": "@AlcornSports", "instagram": "@alcornsports", "youtube": "AlcornStateSports" }
  },
  "website": "https://alcornsports.com",
  "stadium": {
    "name": "Spinks-Casem Stadium",
    "capacity": 10000,
    "surface": "Natural Grass",
    "built": 1992,
    "recordAttendance": 22500,
    "notableFeature": "Known for the intense tailgating atmosphere stretching into the surrounding woods.",
    "seatingSections": { "studentSection": "Sections J-M", "bandSection": "Section N" }
  },
  "athletics": {
    "affiliation": "NCAA Division I FCS",
    "conference": {
      "current": "SWAC",
      "division": "East",
      "joined": 1962
    },
    "nationalChampionships": [],
    "conferenceChampionships": [1960, 1968, 1969, 1970, 1974, 1976, 1979, 1984, 1992, 1994, 2014, 2015, 2018, 2019],
    "nflDraftPicks": "50+",
    "hallOfFamers": ["Steve McNair"],
    "retiredNumbers": ["9"],
    "rivalries": [
      { "teamId": "jackson_state", "gameName": "The Soul Bowl", "trophy": "Soul Bowl Trophy" },
      { "teamId": "mississippi_valley", "gameName": "The A-Line Rivalry", "trophy": null }
    ]
  },
  "marchingBand": {
    "name": "Sounds of Dyn-O-Mite",
    "nickname": "SOD",
    "founded": 1960,
    "size": 250,
    "signatureSelection": "Fanfare",
    "danceTeamName": "Golden Girls",
    "flagLineName": "Purple Flashers",
    "drumMajorStyle": "High-stepping, acrobatic",
    "specialEntrance": "The SOD Run-On",
    "philosophy": "High-energy performances blending traditional marching styles with contemporary showmanship.",
    "famousHalftimeRoutines": ["The Michael Jackson Tribute 2018"],
    "bandRivalries": ["Sonic Boom of the South (Jackson State)"]
  },
  "gamedayCulture": {
    "traditionTitle": "The Brave Way",
    "teamWalk": {
      "name": "The Brave Walk",
      "description": "The team processes through a gauntlet of thousands of fans heading into the stadium."
    },
    "signatureChants": [
      { "name": "Drive for Six", "lyrics": "Go Braves! Drive for six!", "cue": "Played after a big first down" }
    ],
    "tailgateCulture": {
      "name": "Reservation Tailgate",
      "description": "A massive family reunion atmosphere featuring deep-south BBQ and live DJs.",
      "signatureFood": "Smoked turkey legs and fried catfish"
    },
    "fightSong": "Alcorn Ode",
    "almaMater": "Beneath the shade of giant trees..."
  },
  "wiki": {
    "briefHistory": "Founded in 1871 as Alcorn University, it is the oldest public historically black land-grant institution in the United States.",
    "famousFirsts": [
      "First black land-grant institution in the nation.",
      "Hiram R. Revels, the first African American to serve in the U.S. Senate, was its first president."
    ],
    "notableAlumni": [
      { "name": "Steve McNair", "field": "Athletics", "achievement": "NFL MVP and legendary quarterback." },
      { "name": "Alex Haley", "field": "Literature", "achievement": "Author of 'Roots'." },
      { "name": "Medgar Evers", "field": "Civil Rights", "achievement": "Legendary civil rights activist." }
    ],
    "architectureStyle": "A mix of historic brick landmarks and modern athletic facilities.",
    "funFacts": [
      "The campus is located on 1,700 acres of land in rural Claiborne County.",
      "The school was originally named after Mississippi Governor James L. Alcorn."
    ]
  },
  "influencers": [
    // Future: List of social media, cultural, and community influencers connected to the school
    // Example: { "name": "John Doe", "platform": "Instagram", "handle": "@johnnybrave", "focus": "Band culture" }
  ]
}
```

---

### Notes
- All fields should be filled for every school.
- The `influencers` section is reserved for future use and can include prominent alumni, social media personalities, or cultural figures.
- This schema is designed for editorial flexibility and can be extended as needed.
