# Frontend Export Documentation

## Overview

This directory contains two distinct data endpoints designed for different purposes:

## Endpoint 1: Raw Entity Storage Data (Normalized)
**Location**: `11-entity/`
**Purpose**: Database storage and API backend consumption
**Format**: Normalized relational data

### Files Structure
```
11-entity/
├── persons.json                           # All persons (players, coaches, officials) with role_types
├── seasons/
│   ├── coaches/
│   │   └── coach_seasons_2025.json        # Coach season assignments
│   └── officials/
│       └── official_seasons_2025.json     # Official season records
├── assignments/
│   └── official_assignments_2025.json     # Game assignments
└── teams/
    └── teams.json                         # Team master data
```

**Status**: ❌ NOT frontend-ready (normalized relational data for database)

---

## Endpoint 2: Analytics-Enhanced Frontend Exports (Denormalized)
**Location**: `5-enrichment/frontend_exports/`
**Purpose**: Direct frontend consumption
**Format**: Optimized, denormalized with embedded analytics

### Primary Frontend Export
**File**: `ALL_2025_entities_frontend_ready.json`
**Purpose**: Unified export containing all entities in a single payload

```json
{
  "export_timestamp": "2026-03-28",
  "export_version": "v3_unified_entities", 
  "season": 2025,
  "entities": {
    "teams": {
      "team_id": {
        "team_info": {...},
        "coaches": [...],
        "roster_analytics": {...},
        "players": [...]
      }
    },
    "coaches": [...],
    "officials": [...]
  }
}
```

### Specialized Exports
- **`teams_2025_frontend_ready.json`** - Team-focused data with embedded coaches
- **`coaches_2025_frontend_ready.json`** - Coach careers and assignments
- **`officials_2025_frontend_ready.json`** - Official assignments and conferences

**Status**: ✅ FRONTEND-READY (optimized, denormalized with embedded analytics)

---

## Frontend Integration Guide

### Which Endpoint to Use?

**For Frontend Development**: Use **Endpoint 2** (`5-enrichment/frontend_exports/`)

**Why Endpoint 2 is Frontend-Ready**:
- ✅ Pre-joined data eliminates multiple API calls
- ✅ Embedded analytics reduce client-side processing
- ✅ Optimized JSON structure for frontend consumption
- ✅ Single-file exports for faster initial load
- ✅ Consistent data format across all entity types

### Recommended Usage Patterns

#### 1. **Primary Application Data**
```javascript
// Load the unified export for complete application state
const response = await fetch('/api/entities/ALL_2025_entities_frontend_ready.json');
const data = await response.json();
```

#### 2. **Feature-Specific Data**
```javascript
// Load specific entity data for focused features
const teamsData = await fetch('/api/entities/teams_2025_frontend_ready.json');
const coachesData = await fetch('/api/entities/coaches_2025_frontend_ready.json');
```

### Data Structure Highlights

#### Team Data Structure
```json
{
  "team_id": {
    "team_info": {
      "team_id": "string",
      "team_name": "string",
      "conference": "string",
      "division": "string"
    },
    "coaches": [
      {
        "coach_id": "string",
        "name": "string",
        "position": "string",
        "season": 2025
      }
    ],
    "roster_analytics": {
      "total_players": "number",
      "position_distribution": {...},
      "class_distribution": {...}
    },
    "players": [
      {
        "player_id": "string",
        "name": "string",
        "position": "string",
        "class": "string",
        "jersey_number": "string",
        "height": "string",
        "weight": "string",
        "hometown": "string",
        "image_url": "string"
      }
    ]
  }
}
```

#### Coach Data Structure
```json
{
  "coach_id": {
    "coach_info": {
      "coach_id": "string",
      "name": "string",
      "title": "string"
    },
    "assignments": [
      {
        "team_id": "string",
        "team_name": "string",
        "season": 2025,
        "position": "string"
      }
    ],
    "career_stats": {...}
  }
}
```

#### Official Data Structure
```json
{
  "official_id": {
    "official_info": {
      "official_id": "string",
      "name": "string",
      "title": "string"
    },
    "assignments": [
      {
        "game_id": "string",
        "teams": ["string"],
        "date": "string",
        "conference": "string"
      }
    ],
    "conference_affiliations": [...]
  }
}
```

---

## Implementation Notes

### Data Processing Pipeline
1. **Raw Data Collection**: Entity data extracted from source systems
2. **Normalization**: Data structured for relational storage (`11-entity/`)
3. **Analytics Enhancement**: Statistical analysis and computed fields added
4. **Denormalization**: Data optimized for frontend consumption
5. **Export Generation**: Frontend-ready JSON files created

### Update Frequency
- **Season 2025 Data**: Complete and final
- **Future Seasons**: Pipeline ready for incremental updates
- **Analytics**: Computed fields update with new game data

### Performance Considerations
- **File Sizes**: 
  - `ALL_2025_entities_frontend_ready.json`: ~2.5MB
  - Individual exports: 200KB - 800KB each
- **Loading Strategy**: Load unified export initially, use specialized exports for feature-specific needs

---

## Frontend Development Recommendations

### 1. **Initial Load Strategy**
```javascript
// Load unified data on app initialization
async function loadApplicationData() {
  const response = await fetch('/api/entities/ALL_2025_entities_frontend_ready.json');
  return await response.json();
}
```

### 2. **Data Caching**
```javascript
// Cache data in memory for performance
let entitiesCache = null;

async function getEntities() {
  if (!entitiesCache) {
    entitiesCache = await loadApplicationData();
  }
  return entitiesCache;
}
```

### 3. **Feature-Specific Accessors**
```javascript
// Create helper functions for common data access patterns
function getTeamById(teamId) {
  return entities?.teams?.[teamId] || null;
}

function getCoachById(coachId) {
  return entities?.coaches?.find(c => c.coach_id === coachId) || null;
}
```

---

## API Integration (Future)

While the current frontend-ready files are static JSON exports, the structure is designed to support future API endpoints:

### Planned API Structure
```
GET /api/entities/teams/{season}           # Team data with coaches
GET /api/entities/coaches/{season}         # Coach careers and assignments  
GET /api/entities/officials/{season}       # Official assignments
GET /api/entities/unified/{season}         # Complete unified export
```

### Response Format
API responses will follow the same structure as the frontend-ready JSON files, ensuring seamless migration from static files to dynamic API endpoints.

---

## Contact & Support

For questions about data structure, API development, or frontend integration:

- **Data Architecture**: Refer to this documentation
- **API Development**: Use the frontend-ready export structure as the contract
- **Frontend Integration**: Follow the recommended usage patterns above

**Last Updated**: 2026-03-28
**Export Version**: v3_unified_entities
**Season**: 2025
