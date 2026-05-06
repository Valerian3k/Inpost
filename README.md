# InPost Parcel Locker Finder

## English [EN]

### Overview
This project is a full-stack application built as part of a technical assignment. Its purpose is to interact with the InPost Global Points API and provide a meaningful way to search, rank, and filter parcel lockers based on user location and preferences. The system is designed as a lightweight decision-support tool that helps users find the most relevant parcel locker instead of just the nearest one.

---

### Problem Statement
The raw InPost dataset contains over 90,000 points with different capabilities, locations, and operating constraints. The challenge is not data availability, but making it usable. This project focuses on transforming raw geospatial data into a ranked, filtered and interpretable list of parcel lockers.

---

### Key Features
- Geolocation-based locker discovery
- Ranking system combining distance (primary factor) and feature-based scoring (secondary factor)
- Filters: 24/7 availability, parcel sending, parcel return, Allegro compatibility
- Progressive search radius expansion: 15 km → 30 km → 45 km → 60 km → 100 km
- Fallback messaging when no nearby results exist
- Limiting dataset to 200 nearest points for performance optimization
- Cached backend data layer for API efficiency

---

### Architecture

Frontend (React + TypeScript):
- Handles user interaction and geolocation
- Applies filtering and ranking logic
- Displays best match and alternatives
- Uses memoization for performance optimization
- Precomputes distances to avoid recalculation

Backend (Node.js + Express):
- Fetches data from InPost API
- Stores in-memory cache
- Refreshes cache periodically (1 hour)
- Provides `/api/points` endpoint
- Uses concurrent fetching for performance

---

### Scoring Algorithm
Score is calculated using weighted logic:

score = (distanceScore * 0.9) + (featureScore * 0.1)

DistanceScore is normalized based on proximity, while featureScore rewards useful locker capabilities.

---

### Performance Optimizations
- Limit dataset to 200 nearest points before scoring
- Precomputed distances
- Filtering before scoring
- Backend caching to reduce API calls

---

### Trade-offs
- In-memory cache instead of database (simplicity over scalability)
- No persistence layer
- Recalculation on filter change instead of incremental updates
- Prioritized clarity over over-engineering

---

### Assumptions
- InPost API is stable and available
- User location is accessible
- Dataset fits into memory

---

### How to Run

### Backend
```bash
cd inpost-backend
npm install
node server.js
```

### Frontend
```bash
cd inpost-frontend
npm install
npm run dev
```

Backend runs on:
http://localhost:3001

Frontend runs on:
http://localhost:5173

---

### Possible Improvements
- Replace in-memory cache with Redis or database
- Add map integration (Google Maps / Leaflet)
- Add real-time availability updates
- Add backend pagination
- Add tests for scoring logic

---

### Summary
The project focuses on transforming a large geospatial dataset into a usable decision-support tool with emphasis on performance, ranking logic, and clean architecture.

---

## Polski [PL]

### Opis projektu
Projekt został stworzony jako odpowiedź na zadanie rekrutacyjne. Celem było wykorzystanie API InPost do budowy narzędzia pozwalającego wyszukiwać i oceniać paczkomaty na podstawie lokalizacji i filtrów użytkownika.

---

### Problem
Dane InPost obejmują ponad 90 000 punktów o różnych funkcjach i dostępności. Celem było przekształcenie ich w czytelny system rankingowy.

---

### Funkcje
- wyszukiwanie paczkomatów po lokalizacji
- ranking (odległość + funkcje)
- filtry: 24/7, nadawanie, odbiór, Allegro
- dynamiczny promień wyszukiwania 15–100 km
- cache backendowy
- limit 200 najbliższych punktów

---

### Backend
- pobiera dane z InPost API
- trzyma cache w pamięci
- odświeża co godzinę
- endpoint `/api/points`

---

### Frontend
- pobiera lokalizację użytkownika
- liczy dystans (Haversine)
- sortuje i filtruje dane
- pokazuje najlepszy wynik i alternatywy

---

### Podsumowanie
Projekt skupia się na wydajnym przetwarzaniu danych geolokalizacyjnych i budowie prostego systemu decyzyjnego z naciskiem na jakość, czytelność i świadome kompromisy architektoniczne.
