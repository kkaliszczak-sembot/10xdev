# API Endpoint Implementation Plan: Projects REST API

## 1. Przegląd punktu końcowego

Implementacja REST API dla zasobu `projects` umożliwiającego zarządzanie projektami użytkownika, w tym standardowe operacje CRUD oraz generowanie dokumentów PRD. Wszystkie endpointy wymagają uwierzytelnienia i zapewniają dostęp tylko do projektów należących do zalogowanego użytkownika.

## 2. Szczegóły żądania

### GET /api/projects
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/projects`
- **Parametry**:
  - **Opcjonalne**: 
    - `page`: numer strony (domyślnie: 1)
    - `limit`: liczba elementów na stronę (domyślnie: 10)
    - `search`: wyszukiwanie po nazwie projektu
    - `status`: filtrowanie po statusie ('new', 'in_progress', 'finished')
    - `sort`: sortowanie po polu (domyślnie: 'created_at')
    - `order`: kolejność sortowania ('asc' lub 'desc', domyślnie: 'desc')
- **Request Body**: N/A

### GET /api/projects/:id
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/projects/:id`
- **Parametry**:
  - **Wymagane**: `id` (UUID projektu)
- **Request Body**: N/A

### POST /api/projects
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/projects`
- **Parametry**: N/A
- **Request Body**:
  ```typescript
  {
    name: string; // wymagane
    description?: string | null;
    main_problem?: string | null;
    min_feature_set?: string | null;
    out_of_scope?: string | null;
    success_criteria?: string | null;
  }
  ```

### PUT /api/projects/:id
- **Metoda HTTP**: PUT
- **Struktura URL**: `/api/projects/:id`
- **Parametry**:
  - **Wymagane**: `id` (UUID projektu)
- **Request Body**:
  ```typescript
  {
    name?: string;
    description?: string | null;
    status?: 'new' | 'in_progress' | 'finished';
    main_problem?: string | null;
    min_feature_set?: string | null;
    out_of_scope?: string | null;
    success_criteria?: string | null;
  }
  ```

### DELETE /api/projects/:id
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/projects/:id`
- **Parametry**:
  - **Wymagane**: `id` (UUID projektu)
- **Request Body**: N/A

### POST /api/projects/:id/generate-prd
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/projects/:id/generate-prd`
- **Parametry**:
  - **Wymagane**: `id` (UUID projektu)
- **Request Body**: N/A

## 3. Wykorzystywane typy

### DTOs (Data Transfer Objects)
```typescript
// Już zdefiniowane w types.ts
import {
  ProjectListItemDTO,
  ProjectDetailsDTO,
  PaginationDTO,
  ProjectListResponseDTO,
  DeleteResponseDTO,
  GeneratedPRDDTO
} from '../types';
```

### Command Models
```typescript
// Już zdefiniowane w types.ts
import {
  CreateProjectCommand,
  UpdateProjectCommand,
  ProjectListQueryParams
} from '../types';
```

### Schematy walidacji (Zod)
```typescript
// Nowe schematy do zaimplementowania
export const projectListQuerySchema = z.object({
  page: z.coerce.number().positive().optional().default(1),
  limit: z.coerce.number().positive().max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum(['new', 'in_progress', 'finished']).optional(),
  sort: z.enum(['name', 'created_at', 'updated_at', 'status']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  main_problem: z.string().nullable().optional(),
  min_feature_set: z.string().nullable().optional(),
  out_of_scope: z.string().nullable().optional(),
  success_criteria: z.string().nullable().optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['new', 'in_progress', 'finished']).optional(),
  main_problem: z.string().nullable().optional(),
  min_feature_set: z.string().nullable().optional(),
  out_of_scope: z.string().nullable().optional(),
  success_criteria: z.string().nullable().optional()
});
```

## 4. Szczegóły odpowiedzi

### GET /api/projects
- **Kod sukcesu**: 200 OK
- **Struktura odpowiedzi**:
  ```typescript
  {
    data: ProjectListItemDTO[];
    pagination: PaginationDTO;
  }
  ```

### GET /api/projects/:id
- **Kod sukcesu**: 200 OK
- **Struktura odpowiedzi**:
  ```typescript
  ProjectDetailsDTO
  ```

### POST /api/projects
- **Kod sukcesu**: 201 Created
- **Struktura odpowiedzi**:
  ```typescript
  ProjectDetailsDTO
  ```

### PUT /api/projects/:id
- **Kod sukcesu**: 200 OK
- **Struktura odpowiedzi**:
  ```typescript
  ProjectDetailsDTO
  ```

### DELETE /api/projects/:id
- **Kod sukcesu**: 200 OK
- **Struktura odpowiedzi**:
  ```typescript
  {
    success: true;
    message: string;
  }
  ```

### POST /api/projects/:id/generate-prd
- **Kod sukcesu**: 200 OK
- **Struktura odpowiedzi**:
  ```typescript
  {
    project: ProjectDetailsDTO;
    status: 'success';
    generated_at: string;
  }
  ```

## 5. Przepływ danych

### Architektura
1. **Warstwa kontrolera** (API Endpoints) - obsługuje żądania HTTP, waliduje dane wejściowe, wywołuje serwisy i formatuje odpowiedzi
2. **Warstwa serwisu** (ProjectService) - zawiera logikę biznesową, komunikuje się z bazą danych przez Supabase
3. **Warstwa dostępu do danych** - wykorzystuje Supabase SDK do operacji CRUD na bazie danych

### Przepływ dla GET /api/projects
1. Kontroler odbiera żądanie i waliduje parametry zapytania
2. Kontroler wywołuje ProjectService.getProjects(params)
3. Serwis buduje zapytanie do Supabase z uwzględnieniem filtrów, sortowania i paginacji
4. Serwis wykonuje zapytanie i przetwarza wyniki
5. Kontroler formatuje odpowiedź i zwraca ją klientowi

### Przepływ dla POST /api/projects/:id/generate-prd
1. Kontroler odbiera żądanie i waliduje parametry
2. Kontroler wywołuje ProjectService.generatePRD(id)
3. Serwis pobiera wszystkie dane projektu
4. Serwis sprawdza, czy projekt ma wystarczające informacje do wygenerowania PRD
5. Serwis wywołuje zewnętrzne API AI do wygenerowania PRD
6. Serwis aktualizuje projekt z wygenerowanym PRD
7. Kontroler formatuje odpowiedź i zwraca ją klientowi

## 6. Względy bezpieczeństwa

### Uwierzytelnianie
- Wszystkie endpointy wymagają uwierzytelnienia za pomocą Supabase Auth
- Token JWT musi być dołączony do każdego żądania w nagłówku Authorization

### Autoryzacja
- Row Level Security (RLS) w Supabase zapewnia, że użytkownicy mają dostęp tylko do własnych projektów
- Dodatkowe sprawdzenia autoryzacji w warstwie serwisu dla operacji, które nie są pokryte przez RLS

### Walidacja danych
- Wszystkie dane wejściowe są walidowane za pomocą schematów Zod
- Sanityzacja danych wejściowych przed użyciem w zapytaniach SQL

### Ochrona przed atakami
- Ograniczenie liczby żądań (rate limiting) dla endpointów
- Ochrona przed atakami CSRF poprzez tokeny
- Implementacja nagłówków bezpieczeństwa (CSP, X-Content-Type-Options, itp.)

## 7. Obsługa błędów

### Kody błędów
- **400 Bad Request**: Nieprawidłowe dane wejściowe
  - Brakujące wymagane pola
  - Nieprawidłowe typy danych
  - Nieprawidłowe wartości enum
- **401 Unauthorized**: Brak uwierzytelnienia
  - Brak tokenu JWT
  - Wygasły token JWT
- **403 Forbidden**: Brak uprawnień
  - Próba dostępu do projektu innego użytkownika
- **404 Not Found**: Zasób nie istnieje
  - Projekt o podanym ID nie istnieje
- **422 Unprocessable Entity**: Nie można przetworzyć żądania
  - Niewystarczające informacje do wygenerowania PRD
- **500 Internal Server Error**: Nieoczekiwany błąd serwera

### Struktura odpowiedzi błędu
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

### Logowanie błędów
- Wszystkie błędy są logowane z kontekstem (parametry żądania, ID użytkownika, itp.)
- Błędy krytyczne są zgłaszane do systemu monitorowania

## 8. Rozważania dotyczące wydajności

### Optymalizacja zapytań
- Wykorzystanie indeksów bazy danych dla efektywnego filtrowania i sortowania
- Ograniczenie liczby zwracanych kolumn w zapytaniach listowych
- Paginacja wyników dla dużych zbiorów danych

### Buforowanie
- Implementacja buforowania odpowiedzi dla często używanych zapytań
- Wykorzystanie nagłówków cache-control dla optymalizacji po stronie klienta

### Generowanie PRD
- Asynchroniczne generowanie PRD dla dużych projektów
- Implementacja mechanizmu kolejkowania dla operacji generowania PRD

## 9. Etapy wdrożenia

1. **Przygotowanie struktury projektu**
   - Utworzenie plików kontrolerów, serwisów i schematów walidacji
   - Konfiguracja Supabase SDK

2. **Implementacja schematów walidacji**
   - Zdefiniowanie schematów Zod dla wszystkich danych wejściowych
   - Implementacja middleware walidacji

3. **Implementacja serwisu ProjectService**
   - Metoda getProjects(params) dla listy projektów
   - Metoda getProjectById(id) dla szczegółów projektu
   - Metoda createProject(data) dla tworzenia projektu
   - Metoda updateProject(id, data) dla aktualizacji projektu
   - Metoda deleteProject(id) dla usuwania projektu
   - Metoda generatePRD(id) dla generowania PRD

4. **Implementacja kontrolerów API**
   - Endpoint GET /api/projects
   - Endpoint GET /api/projects/:id
   - Endpoint POST /api/projects
   - Endpoint PUT /api/projects/:id
   - Endpoint DELETE /api/projects/:id
   - Endpoint POST /api/projects/:id/generate-prd

5. **Implementacja obsługi błędów**
   - Middleware do przechwytywania i formatowania błędów
   - Logowanie błędów

6. **Implementacja zabezpieczeń**
   - Middleware uwierzytelniania
   - Konfiguracja nagłówków bezpieczeństwa

7. **Testy**
   - Testy jednostkowe dla serwisów i walidacji
   - Testy integracyjne dla endpointów API
   - Testy wydajnościowe

8. **Dokumentacja**
   - Dokumentacja API (np. OpenAPI/Swagger)
   - Dokumentacja wewnętrzna dla deweloperów

9. **Wdrożenie**
   - Konfiguracja środowiska produkcyjnego
   - Wdrożenie API
   - Monitorowanie i analiza wydajności
