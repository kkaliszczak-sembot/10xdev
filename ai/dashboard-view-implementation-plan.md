# Plan implementacji widoku Dashboard

## 1. Przegląd
Widok Dashboard to strona główna dla zalogowanych użytkowników, której celem jest prezentacja paginowanej listy projektów. Użytkownik ma możliwość przeglądania, filtrowania, wyszukiwania oraz sortowania swoich projektów. Widok dostarcza także mechanizm inicjowania procesu tworzenia nowego projektu.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/`.

## 3. Struktura komponentów
- **DashboardPage** – główny kontener widoku.
  - **SearchBar** – pasek wyszukiwania do filtrowania projektów po nazwie.
  - **FilterPanel** – sekcja z filtrami statusu projektu oraz opcją sortowania.
  - **ProjectList** – lista wyświetlająca karty projektów.
    - **ProjectCard** – pojedyncza karta projektu z nazwą, opisem, datą utworzenia oraz oznaczeniem statusu.
  - **Pagination** – komponent do nawigacji między stronami wyników.
  - **CreateProjectButton** – przycisk umożliwiający przejście do formularza tworzenia nowego projektu.

## 4. Szczegóły komponentów
### DashboardPage
- **Opis**: Główny kontener pobierający dane z API i rozdzielający je do podkomponentów.
- **Skład**: Komponenty: `SearchBar`, `FilterPanel`, `ProjectList`, `Pagination`, `CreateProjectButton`.
- **Obsługiwane interakcje**: Inicjacja pobierania danych, aktualizacja listy przy zmianie filtrów, wyszukiwanie, paginacja.
- **Walidacja**: Weryfikacja poprawności parametrów wyszukiwania oraz filtrów zgodnie z wymaganiami API.
- **Typy**: wykorzystuje główne DTO API (np. `Project`, `PaginationMeta`).
- **Propsy**: Otrzymuje opcjonalne dane inicjalizacyjne przekazane przez serwer.

### SearchBar
- **Opis**: Pasek służący do wpisywania zapytań wyszukiwawczych.
- **Skład**: Pole tekstowe, przycisk resetowania.
- **Obsługiwane interakcje**: Zdarzenie `input` (zmiana treści), `submit` – inicjacja wyszukiwania.
- **Walidacja**: Minimalna długość lub czyszczenie zbędnych znaków.
- **Typy**: `SearchQuery` jako string
- **Propsy**: Callback przekazujący wartość wyszukiwania do rodzica.

### FilterPanel
- **Opis**: Panel umożliwiający filtrowanie projektów według statusów oraz sortowania.
- **Skład**: Lista rozwijana statusów (`new`, `in_progress`, `finished`), kontrolki sortowania (pole wyboru sort field oraz order).
- **Obsługiwane interakcje**: Zmiana wartości selektorów, zdarzenie `change`.
- **Walidacja**: Weryfikacja wybranych wartości z listą dostępnych opcji.
- **Typy**: `ProjectStatus` jako unia stringów, `SortOrder` (asc, desc)
- **Propsy**: Callback dla zmiany filtrów.

### ProjectList
- **Opis**: Wyświetla listę projektów w formie kart.
- **Skład**: Pętla renderująca komponenty `ProjectCard`.
- **Obsługiwane interakcje**: Kliknięcie na kartę (ewentualna nawigacja do szczegółów projektu).
- **Walidacja**: Walidacja danych projektu - sprawdzenie czy wszystkie kluczowe pola są obecne.
- **Typy**: `Project` (id, name, description, status, created_at, updated_at)
- **Propsy**: Lista projektów przekazana z rodzica.

### ProjectCard
- **Opis**: Pojedyncza karta wyświetlająca podsumowanie projektu.
- **Skład**: Elementy HTML: nagłówek (nazwa), paragraf (opis), metadane (data, status) oraz oznaczenia statusu (kolorowe tagi).
- **Obsługiwane interakcje**: Kliknięcie, hover.
- **Walidacja**: Prezentacja poprawnych formatów daty; status mieści się w dopuszczalnych wartościach.
- **Typy**: `Project` (sama struktura)
- **Propsy**: Dane projektu przekazane przez listę.

### Pagination
- **Opis**: Komponent zarządzający paginacją listy projektów.
- **Skład**: Przycisk poprzednia/następna strona, numeracja stron.
- **Obsługiwane interakcje**: Kliknięcia przycisków oraz bezpośrednie wybieranie numeru strony.
- **Walidacja**: Prawidłowość numeracji stron (nie przekraczanie dostępnych stron).
- **Typy**: `PaginationMeta` (total_count, page_count, current_page, per_page)
- **Propsy**: Aktualne dane paginacji oraz callback do zmiany strony.

### CreateProjectButton
- **Opis**: Przycisk służący do inicjacji procesu tworzenia nowego projektu.
- **Skład**: Przyciski z ikonami oraz tekstem.
- **Obsługiwane interakcje**: Kliknięcie, nawigacja do formularza tworzenia projektu.
- **Walidacja**: Brak specyficznych walidacji poza standardową interakcją.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**: Callback na click przekazany z rodzica.

## 5. Typy
- **Project**: {
  id: string,
  name: string,
  description: string,
  status: 'new' | 'in_progress' | 'finished',
  created_at: string, // ISO timestamp
  updated_at: string  // ISO timestamp
}

- **PaginationMeta**: {
  total_count: number,
  page_count: number,
  current_page: number,
  per_page: number
}

- **API Response**: {
  data: Project[],
  pagination: PaginationMeta
}

## 6. Zarządzanie stanem
Stan widoku zarządzany będzie przy użyciu mechanizmu reaktywności (Composition API) Vue 3. W głównym komponencie (`DashboardPage`) utworzymy:
- `projects` – lista projektów
- `pagination` – metadane paginacji
- `filters` – obiekt zawierający bieżące kryteria wyszukiwania, filtrowania i sortowania

Może być też stworzony customowy hook (np. `useProjects`) odpowiedzialny za:
- Pobieranie danych z API
- Aktualizację stanu przy zmianie filtrów
- Obsługę błędów podczas pobierania danych

## 7. Integracja API
Integracja z API odbywa się poprzez wysłanie żądania GET do endpointu `/api/projects`. W zapytaniu uwzględniamy następujące parametry:
- `page` – numer strony
- `limit` – liczba pozycji na stronę (domyślnie 10)
- `search` – wyszukiwanie po nazwie projektu
- `status` – filtr po statusie projektu
- `sort` – pole sortowania (domyślnie `created_at`)
- `order` – kierunek sortowania (domyślnie `desc`)

Odpowiedź z API zawiera:
- Tablicę projektów
- Metadane paginacji

Przy wysyłaniu żądania konieczna będzie walidacja parametrów oraz formatowanie odpowiedzi zgodnie z typami `Project` i `PaginationMeta`.

## 8. Interakcje użytkownika
- Wpisanie tekstu w `SearchBar` inicjuje filtrację listy projektów wg nazwy.
- Zmiana wartości w `FilterPanel` (status, sortowanie) aktualizuje widok listy.
- Kliknięcie w przyciski paginacji powoduje zmianę strony i ponowne pobranie danych.
- Kliknięcie w `ProjectCard` może prowadzić do wyświetlenia szczegółów projektu (ewentualna nawigacja).
- Kliknięcie `CreateProjectButton` przekierowuje do formularza tworzenia projektu.

## 9. Warunki i walidacja
- Parametry wyszukiwania (SearchBar) muszą zostać poprawnie sformatowane przed wysłaniem żądania.
- Filtry w `FilterPanel` muszą przyjmować wyłącznie dozwolone wartości (status: 'new', 'in_progress', 'finished'; sort order: 'asc' lub 'desc').
- Dane z API muszą być walidowane pod kątem zgodności z oczekiwanymi typami: np. format daty w polach `created_at` i `updated_at`.

## 10. Obsługa błędów
- W przypadku błędów sieciowych lub nieautoryzowanego dostępu (błąd 401, 400) – wyświetlenie komunikatu błędu na widoku.
- Obsługa sytuacji pustej listy projektów – wyświetlenie informacji, że użytkownik nie posiada jeszcze projektów.
- Walidacja lokalna danych wejściowych (SearchBar, FilterPanel) – wyświetlanie natychmiastowego feedbacku dla użytkownika.

## 11. Kroki implementacji
1. Utworzenie struktury folderów i komponentów w oparciu o podany stack technologiczny (Astro, TypeScript, Vue 3, Tailwind, shadcn/ui).
2. Implementacja głównego komponentu `DashboardPage` z integracją customowego hooka `useProjects` do pobierania danych.
3. Stworzenie komponentów `SearchBar`, `FilterPanel`, `ProjectList` (oraz wewnętrznego `ProjectCard`), `Pagination` i `CreateProjectButton`.
4. Połączenie komponentów w `DashboardPage` i obsługa komunikacji między nimi (emitowanie zdarzeń, callbacki).
5. Integracja z API: wysyłanie żądania GET do `/api/projects` wraz z odpowiednimi parametrami; walidacja odpowiedzi i aktualizacja stanu.
6. Implementacja mechanizmu obsługi błędów i wyświetlanie komunikatów użytkownikowi.
7. Testowanie interakcji użytkownika (wyszukiwanie, filtrowanie, paginacja) oraz responsywności widoku.
8. Refaktoryzacja kodu i usunięcie potencjalnych problemów walidacyjnych.
9. Finalne testy end-to-end oraz walidacja zgodności z wymaganiami PRD i user stories.
