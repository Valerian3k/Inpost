# InPost Parcel Locker Finder

## English [EN]

### Why this solution

I chose to focus on building a decision-support tool rather than a simple “nearest locker” finder. The InPost dataset is large and rich in attributes, so returning a raw proximity-based list does not reflect real user needs.

In practice, users often care about more than distance such as 24/7 availability, ability to send or return parcels, or carrier compatibility (e.g. Allegro). For this reason, I introduced a scoring system that combines distance as the primary factor with feature-based bonuses.

Additionally, I implemented progressive radius expansion and dataset limiting to ensure the application remains responsive even with a large number of points.

---

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

DistanceScore is normalized based on relative proximity within the candidate set, while featureScore is computed as a weighted sum of selected capabilities (e.g. 24/7 availability, parcel sending, returns, Allegro support).

---

### Filtering Strategy and Edge Cases

Filters are implemented as hard constraints and applied before the ranking phase to reduce the dataset size and improve performance.

Additionally, the same constraints are enforced inside the scoring function (by returning `-Infinity`) to ensure consistency and prevent invalid results from being ranked in edge scenarios.

The system handles sparse results using progressive radius expansion (15 → 30 → 60 → 100 km). If no lockers are found within smaller radii, the search area is gradually increased.

An important edge case occurs when only a small number of lockers satisfy all filters and are located relatively far from the user. In such situations, the system prioritizes constraint satisfaction over proximity, meaning that a farther but fully compatible locker will be ranked above closer but incompatible ones.

This reflects a deliberate design decision: filters define necessity, while scoring defines preference.

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
```
```bash
npm install
```
```bash
node server.js
```

### Frontend
```bash
cd inpost-frontend
```
```bash
npm install
```
```bash
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

### Dlaczego takie rozwiązanie

Zdecydowałem się skupić na stworzeniu narzędzia wspierającego podejmowanie decyzji, zamiast prostego wyszukiwacza „najbliższego paczkomatu”. Zbiór danych InPost jest duży i bogaty w atrybuty, dlatego zwracanie listy opartej wyłącznie na odległości nie odpowiada realnym potrzebom użytkowników.

W praktyce użytkownicy często zwracają uwagę na coś więcej niż dystans — np. dostępność 24/7, możliwość nadawania lub zwrotu przesyłek czy kompatybilność z przewoźnikiem (np. Allegro). Z tego powodu wprowadziłem system punktowy, który łączy odległość jako główny czynnik z dodatkowymi punktami za spełnianie określonych cech.

Dodatkowo zaimplementowałem progresywne rozszerzanie promienia wyszukiwania oraz ograniczanie zbioru danych, aby zapewnić płynne działanie aplikacji nawet przy dużej liczbie punktów.

---

### Przegląd

Projekt to aplikacja full-stack stworzona w ramach zadania technicznego. Jej celem jest integracja z API InPost Global Points oraz dostarczenie sensownego sposobu wyszukiwania, filtrowania i rankingowania paczkomatów na podstawie lokalizacji użytkownika i jego preferencji. System został zaprojektowany jako lekkie narzędzie wspomagające decyzje — zamiast wskazywać tylko najbliższy punkt, proponuje najbardziej dopasowany.

---

### Problem

Surowy zbiór danych InPost zawiera ponad 90 000 punktów o różnych możliwościach, lokalizacjach i ograniczeniach operacyjnych. Wyzwanie nie polega na dostępności danych, lecz na ich użytecznym przetworzeniu. Projekt koncentruje się na przekształceniu danych geolokalizacyjnych w uporządkowaną, filtrowaną i interpretowalną listę paczkomatów.

---

### Kluczowe funkcje

- Wyszukiwanie paczkomatów na podstawie geolokalizacji  
- System rankingowy łączący odległość (czynnik główny) i ocenę funkcji (czynnik pomocniczy)  
- Filtry: dostępność 24/7, nadawanie przesyłek, zwroty, kompatybilność z Allegro  
- Progresywne rozszerzanie promienia wyszukiwania: 15 km → 30 km → 45 km → 60 km → 100 km  
- Komunikaty fallback w przypadku braku wyników w pobliżu  
- Ograniczenie zbioru do 200 najbliższych punktów dla optymalizacji wydajności  
- Buforowana warstwa backendowa dla efektywności API  

---

### Architektura

Frontend (React + TypeScript):
- Obsługa interakcji użytkownika i geolokalizacji  
- Filtrowanie i ranking danych  
- Wyświetlanie najlepszego dopasowania oraz alternatyw  
- Memoizacja dla poprawy wydajności  
- Wstępne obliczanie odległości  

Backend (Node.js + Express):
- Pobieranie danych z API InPost  
- Przechowywanie w pamięci (cache)  
- Okresowe odświeżanie cache (co 1 godzinę)  
- Endpoint `/api/points`  
- Równoległe pobieranie danych dla lepszej wydajności  

---

### Algorytm punktacji

Wynik obliczany jest według następującego wzoru:

score = (distanceScore * 0.9) + (featureScore * 0.1)

distanceScore jest normalizowany na podstawie względnej odległości w zbiorze kandydatów, natomiast featureScore to suma ważona wybranych cech (np. dostępność 24/7, nadawanie, zwroty, obsługa Allegro).

---

### Strategia filtrowania i przypadki brzegowe

Filtry są traktowane jako twarde ograniczenia i stosowane przed etapem rankingowania, co zmniejsza zbiór danych i poprawia wydajność.

Dodatkowo te same warunki są egzekwowane w funkcji scoringowej (poprzez zwracanie `-Infinity`), aby zapewnić spójność i uniknąć błędów w sytuacjach brzegowych.

System radzi sobie z małą liczbą wyników poprzez progresywne zwiększanie promienia wyszukiwania (15 → 30 → 60 → 100 km). Jeśli w mniejszych zakresach nie zostaną znalezione paczkomaty, obszar wyszukiwania jest stopniowo rozszerzany.

Istotnym przypadkiem brzegowym jest sytuacja, gdy tylko niewielka liczba paczkomatów spełnia wszystkie filtry i znajdują się one daleko od użytkownika. W takim przypadku system priorytetyzuje spełnienie wymagań nad odległością — dalszy, ale zgodny punkt zostanie oceniony wyżej niż bliższy, który nie spełnia kryteriów.

Jest to świadoma decyzja projektowa: filtry definiują konieczność, a scoring określa preferencje.

---

### Optymalizacje wydajności

- Ograniczenie danych do 200 najbliższych punktów przed scoringiem  
- Wstępne obliczanie odległości  
- Filtrowanie przed rankingiem  
- Cache po stronie backendu w celu ograniczenia liczby zapytań do API  

---

### Kompromisy

- Cache w pamięci zamiast bazy danych (prostota kosztem skalowalności)  
- Brak warstwy persystencji  
- Przeliczanie wyników przy zmianie filtrów zamiast aktualizacji inkrementalnej  
- Priorytet czytelności nad nadmierną optymalizacją  

---

### Założenia

- API InPost jest stabilne i dostępne  
- Lokalizacja użytkownika jest dostępna  
- Zbiór danych mieści się w pamięci  

---

### Jak uruchomić

### Backend
cd inpost-backend
npm install
node server.js

### Frontend
cd inpost-frontend
npm install
npm run dev

Backend działa na:
http://localhost:3001

Frontend działa na:
http://localhost:5173

---

### Możliwe usprawnienia

- Zastąpienie cache w pamięci przez Redis lub bazę danych  
- Integracja z mapami (Google Maps / Leaflet)  
- Aktualizacje dostępności w czasie rzeczywistym  
- Paginacja po stronie backendu  
- Testy dla logiki scoringowej  

---

### Podsumowanie

Projekt koncentruje się na przekształceniu dużego zbioru danych geolokalizacyjnych w użyteczne narzędzie wspierające decyzje, z naciskiem na wydajność, logikę rankingową oraz przejrzystą architekturę.
