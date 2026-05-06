# InPost Parcel Locker Finder

---

# Table of Contents (EN)

- [Why this solution](#why-this-solution)
- [Overview](#overview)
- [Problem](#problem)
- [Key features](#key-features)
- [Architecture](#architecture)
  - [Backend (Node.js + Express)](#backend-nodejs--express)
  - [Frontend (React + TypeScript)](#frontend-react--typescript)
  - [Data flow](#data-flow)
- [Scoring algorithm](#scoring-algorithm)
- [Filtering strategy and edge cases](#filtering-strategy-and-edge-cases)
- [Performance optimizations](#performance-optimizations)
- [Assumptions](#assumptions)
- [Run project](#run-project)
- [Summary](#summary)

# Spis treści (PL)

- [Dlaczego takie rozwiązanie](#dlaczego-takie-rozwiązanie)
- [Przegląd](#przegląd)
- [Problem](#problem-pl)
- [Kluczowe funkcje](#kluczowe-funkcje)
- [Architektura](#architektura)
  - [Backend (Node.js + Express)](#backend-nodejs--express-pl)
  - [Frontend (React + TypeScript)](#frontend-react--typescript-pl)
  - [Przepływ danych](#przepływ-danych)
- [Algorytm punktacji](#algorytm-punktacji)
- [Strategia filtrowania i przypadki brzegowe](#strategia-filtrowania-i-przypadki-brzegowe)
- [Optymalizacje wydajności](#optymalizacje-wydajności)
- [Założenia](#założenia)
- [Jak uruchomić](#jak-uruchomić)
- [Podsumowanie](#podsumowanie)

---

## English [EN]

---

## Why this solution

I decided to focus on building a decision-support tool instead of a simple “nearest parcel locker” search engine. The InPost dataset is large and rich in attributes, so returning a list based only on distance does not reflect users’ real needs.

Users also often consider more than just distance, such as 24/7 availability, the ability to send or return parcels, or compatibility with specific carriers (e.g. Allegro). For this reason, I introduced a scoring system that combines distance as the main factor with additional points for specific features.

Additionally, I implemented progressive search radius expansion and dataset reduction to ensure smooth application performance even with a large number of points.

---

## Overview

The goal is to integrate with the InPost Global Points API and provide a meaningful way to search, filter, and rank parcel lockers based on user location and preferences. The system is designed as a lightweight decision-support tool: instead of returning only the nearest point, it suggests the most suitable one.

---

## Problem

The raw InPost dataset contains over 90,000 points with different capabilities, locations, and operational constraints. The challenge is not data availability, but its meaningful processing. The project focuses on transforming geolocation data into a structured, filtered, and interpretable list of parcel lockers.

---

## Key features

- Search for parcel lockers based on geolocation
- Ranking system combining distance (primary factor) and feature-based scoring (secondary factor) 
- Filters: 24/7 availability, parcel sending, returns, Allegro compatibility 
- Progressive search radius expansion: 15 km → 30 km → 45 km → 60 km → 100 km  
- Fallback messages when no nearby results are found  
- Limiting dataset to the 200 closest points for performance optimization  
- Cached backend layer for API efficiency  

---

### Architecture

The system is designed as a lightweight decision-support application where the frontend handles most of the data processing logic, while the backend acts as a proxy layer for external API communication.

#### Backend (Node.js + Express)
The backend serves as a thin integration layer between the application and the InPost API.

- Fetches data from the InPost Global Points API
- Stores data in memory (cache) to reduce API requests
- Exposes data via the `/api/points` endpoint
- Refreshes cache periodically
- Contains no business logic related to ranking or filtering

This approach was chosen due to external API limitations and the need to keep the backend as lightweight as possible.

#### Frontend (React + TypeScript)

The frontend handles all processing and presentation logic.

- Fetches data from the backend and processes it locally
- Calculates distance between user and parcel lockers (Haversine formula)
- Performs real-time filtering and ranking
- Implements a scoring system combining distance and feature attributes
- Handles progressive search radius expansion (15 → 100 km)
- Responds dynamically to filter changes

This approach was chosen because of:
- API limitations (no server-side enrichment possible)
- Need for fast user interaction
- Reduced backend load and fewer requests

#### Data flow

1. The user shares their location
2. The frontend fetches data from the backend
3. The backend returns cached data (from InPost API)
4. The frontend::
   - calculates distances
   - filters data
   - applies ranking
   - selects the best match

## Scoring algorithm
The score is calculated using the following formula:

score = (distanceScore * 0.9) + (featureScore * 0.1)

distanceScore is normalized based on relative distance within the candidate set, while featureScore is a weighted sum of selected attributes (e.g. 24/7 availability, sending, returns, Allegro support).

---

## Filtering strategy and edge cases

Filters are treated as hard constraints and applied before the ranking stage, which reduces the dataset and improves performance.

Additionally, the same conditions are enforced in the scoring function (by returning -Infinity) to ensure consistency and prevent edge-case errors.

The system handles low-result scenarios through progressive search radius expansion (15 → 30 → 60 → 100 km). If no parcel lockers are found in smaller ranges, the search area is gradually expanded.

A key edge case occurs when only a small number of parcel lockers meet all filters and are located far from the user. In this case, the system prioritizes requirement compliance over distance — a farther but compliant point is ranked higher than a closer one that does not meet the criteria.

This is a deliberate design decision: filters define necessity, while scoring defines preference.

---

## Performance optimizations

- Limiting dataset to the 200 nearest points before scoring 
- Precomputed distances  
- Filtering before ranking  
- Backend caching to reduce API requests 

---

## Assumptions

- The InPost API is stable and available  
- User location is accessible  
- Dataset fits in memory  

---

## Run project

Requirements:
- Node.js (recommended v18 or newer)
- npm

Check versions:
```bash
node -v
```
```bash
npm -v
```

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

On startup, the backend takes approximately 1–2 minutes to initialize because it fetches and caches data from the InPost API. The server will start normally, but will only be fully ready after the initial data load is completed.

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

Backend: http://localhost:3001  
Frontend: http://localhost:5173  

---

## Summary

The project focuses on transforming a large geolocation dataset into a useful decision-support tool, emphasizing performance, ranking logic, and a clear architecture.

---

## Polski [PL]

### Dlaczego takie rozwiązanie

Zdecydowałem się skupić na stworzeniu narzędzia wspierającego podejmowanie decyzji, zamiast prostego wyszukiwacza „najbliższego paczkomatu”. Zbiór danych InPost jest duży i bogaty w atrybuty, dlatego zwracanie listy opartej wyłącznie na odległości nie odpowiada realnym potrzebom użytkowników.

Użytkownicy również często zwracają uwagę na coś więcej niż tylko dystans np. dostępność 24/7, możliwość nadawania lub zwrotu przesyłek czy kompatybilność z przewoźnikiem (np. Allegro). Z tego powodu wprowadziłem system punktowy, który łączy odległość jako główny czynnik z dodatkowymi punktami za spełnianie określonych cech.

Dodatkowo zaimplementowałem progresywne rozszerzanie promienia wyszukiwania oraz ograniczanie zbioru danych, aby zapewnić płynne działanie aplikacji nawet przy dużej liczbie punktów.

---

### Przegląd

Celem jest integracja z API InPost Global Points oraz dostarczenie sensownego sposobu wyszukiwania, filtrowania i rankingowania paczkomatów na podstawie lokalizacji użytkownika i jego preferencji. System został zaprojektowany jako lekkie narzędzie wspomagające decyzje, zamiast wskazywać tylko najbliższy punkt, proponuje najbardziej dopasowany.

---
<a id="problem-pl"></a>
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

System został zaprojektowany jako lekka aplikacja typu decision-support, w której frontend odpowiada za większość logiki przetwarzania danych, a backend pełni rolę warstwy pośredniej do komunikacji z zewnętrznym API.

<a id="backend-nodejs--express-pl"></a>
#### Backend (Node.js + Express)
Backend działa jako cienka warstwa integracyjna pomiędzy aplikacją a API InPost.

- Pobiera dane z InPost Global Points API
- Przechowuje dane w pamięci (cache), aby ograniczyć liczbę zapytań
- Udostępnia dane przez endpoint `/api/points`
- Odświeża cache cyklicznie
- Nie zawiera logiki biznesowej związanej z rankingiem lub filtrowaniem

To podejście zostało wybrane ze względu na ograniczenia zewnętrznego API oraz potrzebę utrzymania backendu w możliwie lekkiej formie.

<a id="frontend-react--typescript-pl"></a>
#### Frontend (React + TypeScript)

Frontend odpowiada za całą logikę przetwarzania i prezentacji danych.

- Pobiera dane z backendu i przetwarza je lokalnie
- Oblicza dystans między użytkownikiem a paczkomatami (Haversine)
- Wykonuje filtrowanie oraz ranking w czasie rzeczywistym
- Implementuje system scoringowy łączący odległość i cechy punktów
- Obsługuje progresywne rozszerzanie promienia wyszukiwania (15 → 100 km)
- Odpowiada za dynamiczną reakcję na zmiany filtrów

Takie podejście zostało świadomie wybrane ze względu na:
- ograniczenia API (brak możliwości server-side enrichment)
- potrzebę szybkiej interakcji użytkownika
- redukcję obciążenia backendu i liczby requestów

#### Przepływ danych

1. Użytkownik udostępnia lokalizację
2. Frontend pobiera dane z backendu
3. Backend zwraca dane z cache (API InPost)
4. Frontend:
   - oblicza dystanse
   - filtruje dane
   - stosuje ranking
   - wybiera najlepsze dopasowanie  

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

Istotnym przypadkiem brzegowym jest sytuacja, gdy tylko niewielka liczba paczkomatów spełnia wszystkie filtry i znajdują się one daleko od użytkownika. W takim przypadku system priorytetyzuje spełnienie wymagań nad odległością dalszy, ale zgodny punkt zostanie oceniony wyżej niż bliższy, który nie spełnia kryteriów.

Jest to świadoma decyzja projektowa: filtry definiują konieczność, a scoring określa preferencje.

---

### Optymalizacje wydajności

- Ograniczenie danych do 200 najbliższych punktów przed scoringiem  
- Wstępne obliczanie odległości  
- Filtrowanie przed rankingiem  
- Cache po stronie backendu w celu ograniczenia liczby zapytań do API  

---

### Założenia

- API InPost jest stabilne i dostępne  
- Lokalizacja użytkownika jest dostępna  
- Zbiór danych mieści się w pamięci  

---

### Jak uruchomić

Wymagania
- Node.js (zalecane v18 lub nowsze)
- npm

Sprawdzenie wersji:
```bash
node -v
```
```bash
npm -v
```

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

Przy uruchomieniu backend potrzebuje około 1–2 minut, aby pobrać i zbuforować dane z API InPost. Serwer startuje normalnie, ale będzie w pełni gotowy dopiero po zakończeniu ładowania danych.

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

Backend działa na:
http://localhost:3001

Frontend działa na:
http://localhost:5173

---

### Podsumowanie

Projekt koncentruje się na przekształceniu dużego zbioru danych geolokalizacyjnych w użyteczne narzędzie wspierające decyzje, z naciskiem na wydajność, logikę rankingową oraz przejrzystą architekturę.
