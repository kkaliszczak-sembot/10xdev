<plan_testów>

# Plan Testów dla Projektu "Project Manager (10x-project-manager)"

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument przedstawia kompleksowy plan testów dla aplikacji webowej "Project Manager". Aplikacja ta, oparta na sztucznej inteligencji, ma na celu transformację surowych pomysłów projektowych w szczegółowe dokumenty wymagań produktowych (PRD) poprzez interaktywny, iteracyjny proces. Plan ten został stworzony w celu zapewnienia wysokiej jakości produktu, jego stabilności, bezpieczeństwa oraz zgodności z wymaganiami funkcjonalnymi i niefunkcjonalnymi.

### 1.2. Cele Testowania

Główne cele procesu testowania to:

*   Weryfikacja, czy wszystkie zaimplementowane funkcjonalności działają zgodnie z dokumentacją (README.md, ai/prd.md, ai/api-plan.md, ai/ui-plan.md).
*   Identyfikacja i zaraportowanie defektów oraz niespójności w aplikacji.
*   Zapewnienie, że aplikacja jest intuicyjna, użyteczna i spełnia oczekiwania użytkowników.
*   Ocena stabilności i wydajności aplikacji pod różnymi obciążeniami.
*   Weryfikacja bezpieczeństwa danych użytkowników i ochrony przed typowymi zagrożeniami webowymi.
*   Sprawdzenie poprawności integracji z usługami zewnętrznymi (Supabase, Openrouter.ai).
*   Zapewnienie, że aplikacja jest responsywna i działa poprawnie na różnych przeglądarkach i urządzeniach (web-only).
*   Potwierdzenie zgodności z wytycznymi dotyczącymi kodowania i standardami jakości (ESLint, Prettier, Conventional Commits).

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami:

*   **Moduł Uwierzytelniania:**
    *   Rejestracja nowych użytkowników (email + hasło, walidacja).
    *   Logowanie istniejących użytkowników (walidacja, obsługa błędów).
    *   Mechanizm resetowania hasła poprzez email.
    *   Wylogowywanie.
    *   Zarządzanie sesją użytkownika.
*   **Moduł Zarządzania Profilem Użytkownika:**
    *   Wyświetlanie danych profilu (imię, avatar, data rejestracji).
    *   Możliwość edycji danych profilu (jeśli zaimplementowane).
*   **Moduł Zarządzania Projektami (CRUD):**
    *   Tworzenie nowych projektów (z walidacją nazwy i opisu).
    *   Odczytywanie listy projektów (paginacja, wyszukiwanie po nazwie, filtrowanie po statusie, sortowanie).
    *   Wyświetlanie szczegółów pojedynczego projektu.
    *   Aktualizacja istniejących projektów (zmiana nazwy, opisu, statusu, danych PRD).
    *   Usuwanie projektów (z potwierdzeniem).
*   **Moduł Generowania PRD (Interfejs i Logika AI):**
    *   Interfejs wprowadzania danych do generowania PRD (początkowe pytania).
    *   Iteracyjny proces zadawania pytań przez AI (interakcja z Openrouter.ai).
    *   Zapisywanie odpowiedzi użytkownika na pytania AI.
    *   Generowanie dokumentu PRD na podstawie zebranych informacji.
    *   Wyświetlanie i możliwość edycji wygenerowanego dokumentu PRD.
    *   Logika zmiany statusu projektu w trakcie procesu generowania PRD ('new' -> 'in_progress' -> 'finished').
*   **Integracja z Supabase:**
    *   Poprawność operacji na bazie danych (PostgreSQL).
    *   Działanie polityk RLS (Row Level Security) – użytkownik widzi tylko swoje projekty.
    *   Działanie triggerów i funkcji bazodanowych (np. `update_updated_at_column`, `get_ai_question_sequence`).
*   **Integracja z Openrouter.ai:**
    *   Poprawność wysyłania żądań i odbierania odpowiedzi.
    *   Obsługa błędów komunikacji z API AI.
    *   Logika fallback w przypadku problemów z generowaniem pytań przez AI.
*   **Interfejs Użytkownika (UI/UX):**
    *   Poprawność renderowania stron i komponentów (Astro, Vue).
    *   Responsywność interfejsu (web-only).
    *   Dostępność (zgodność z WCAG, obsługa klawiatury, kontrast).
    *   Intuicyjność nawigacji i przepływów użytkownika.
    *   Spójność wizualna (Tailwind, Shadcn/ui).
    *   Działanie komponentów UI (formularze, przyciski, paginacja, itp.).
    *   Obsługa powiadomień (ToastService).
    *   Działanie hooka `useAutoSave`.
*   **API Backendowe (Astro Server Endpoints):**
    *   Poprawność działania wszystkich endpointów API (parametry, body, odpowiedzi, kody statusu).
    *   Walidacja danych wejściowych (Zod).
    *   Uwierzytelnianie i autoryzacja na poziomie API (middleware).

### 2.2. Funkcjonalności wyłączone z testów (zgodnie z "Boundaries"):

*   Udostępnianie projektów między kontami.
*   Obsługa multimediów (np. wgrywanie obrazów).
*   Aplikacje mobilne/natywne.

## 3. Typy Testów do Przeprowadzenia

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania pojedynczych komponentów, funkcji, serwisów i modułów w izolacji.
    *   **Zakres:**
        *   Funkcje pomocnicze (`src/lib/utils.ts`).
        *   Komponenty Vue (logika, propsy, emity, sloty - np. `LoginForm.vue`, `ProjectCard.vue`, komponenty UI z `src/components/ui/`).
        *   Hooki Vue (`src/composables/useAutoSave.ts`).
        *   Serwisy backendowe (`AuthService`, `ProjectService`, `AIQuestionGeneratorService`, `OpenRouterService`, `PlanningService`) - z mockowaniem zależności (np. `supabaseClient`, API OpenRouter).
        *   Schematy walidacji Zod (`src/pages/api/projects/schemas.ts`).
    *   **Narzędzia:** Vitest, Vue Testing Library.
*   **Testy Integracyjne (Integration Tests):**
    *   **Cel:** Weryfikacja współpracy między różnymi modułami i komponentami systemu.
    *   **Zakres:**
        *   Integracja komponentów Vue (np. `DashboardPage.vue` z `ProjectList.vue`, `SearchBar.vue`, `FilterPanel.vue`).
        *   Integracja frontend <-> backend API (np. `AuthClientService` z endpointami `/api/auth/`, `ProjectClientService` z `/api/projects/`).
        *   Integracja serwisów backendowych z Supabase (bez mockowania Supabase, na dedykowanej bazie testowej lub z transakcjami).
        *   Integracja `AIQuestionGeneratorService` z `OpenRouterService` (z mockowaniem OpenRouter API).
        *   Działanie middleware Astro (`src/middleware/index.ts`) w kontekście żądań do API i stron.
    *   **Narzędzia:** Vitest, Playwright (dla testów API), Supertest (jeśli Vitest nie wystarczy dla API).
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Weryfikacja kompletnych przepływów użytkownika w aplikacji, symulując rzeczywiste scenariusze użycia.
    *   **Zakres:** Testowanie kluczowych historyjek użytkownika (US-001 do US-009 z `ai/prd.md`).
        *   Rejestracja, logowanie, wylogowanie.
        *   Tworzenie projektu, przeglądanie listy, filtrowanie, paginacja.
        *   Rozpoczynanie sesji generowania PRD, odpowiadanie na pytania (początkowe i iteracyjne AI).
        *   Zakończenie sesji PRD i podgląd wygenerowanego dokumentu.
        *   Edycja i usuwanie projektu.
        *   Resetowanie hasła.
    *   **Narzędzia:** Playwright (zgodnie z `.windsurfrules`).
*   **Testy API:**
    *   **Cel:** Bezpośrednie testowanie endpointów API backendu.
    *   **Zakres:** Wszystkie endpointy zdefiniowane w `ai/api-plan.md` oraz zaimplementowane w `src/pages/api/`.
        *   Metody HTTP, parametry zapytania, ciało żądania.
        *   Kody odpowiedzi, struktura odpowiedzi.
        *   Walidacja danych wejściowych.
        *   Autentykacja i autoryzacja (w tym RLS).
    *   **Narzędzia:** Playwright (API testing features), Postman (manualne), Vitest (z fetch lub dedykowaną biblioteką).
*   **Testy Wydajnościowe:**
    *   **Cel:** Ocena responsywności i stabilności aplikacji pod obciążeniem.
    *   **Zakres:**
        *   Czas odpowiedzi API dla listowania projektów (z dużą ilością danych).
        *   Czas generowania PRD.
        *   Obciążenie bazy danych przy operacjach CRUD i wyszukiwaniu.
        *   Czas ładowania kluczowych stron.
    *   **Narzędzia:** k6, Playwright (do pomiaru metryk frontendowych), narzędzia deweloperskie przeglądarki.
*   **Testy Bezpieczeństwa:**
    *   **Cel:** Identyfikacja potencjalnych luk bezpieczeństwa.
    *   **Zakres:**
        *   Weryfikacja polityk RLS Supabase (brak dostępu do danych innych użytkowników).
        *   Ochrona przed XSS (np. w edytowalnych polach PRD, nazwach projektów).
        *   Ochrona przed CSRF (jeśli dotyczy).
        *   Bezpieczeństwo sesji (np. wygasanie tokenów).
        *   Walidacja danych wejściowych (zapobieganie SQL Injection, choć Supabase SDK powinien to zapewniać).
        *   Sprawdzenie nagłówków bezpieczeństwa HTTP.
    *   **Narzędzia:** OWASP ZAP (podstawowe skanowanie), manualna inspekcja kodu, testy penetracyjne (w późniejszej fazie).
*   **Testy Użyteczności (Usability Tests):**
    *   **Cel:** Ocena, jak łatwo i intuicyjnie użytkownicy mogą korzystać z aplikacji.
    *   **Zakres:** Przeprowadzenie testów z potencjalnymi użytkownikami, obserwacja ich interakcji z kluczowymi funkcjami.
    *   **Narzędzia:** Sesje z użytkownikami, narzędzia do nagrywania sesji (np. Hotjar - jeśli budżet pozwoli).
*   **Testy Dostępności (Accessibility Tests):**
    *   **Cel:** Zapewnienie, że aplikacja jest dostępna dla osób z różnymi niepełnosprawnościami.
    *   **Zakres:** Zgodność z WCAG 2.1 AA.
        *   Nawigacja klawiaturą.
        *   Odpowiedni kontrast.
        *   Alternatywne teksty dla obrazów (jeśli będą).
        *   Semantyka HTML.
        *   ARIA attributes.
    *   **Narzędzia:** axe-core (zintegrowane z Playwright lub jako rozszerzenie przeglądarki), Lighthouse.
*   **Testy Wizualne (Visual Regression Tests):**
    *   **Cel:** Wykrywanie niezamierzonych zmian w wyglądzie interfejsu użytkownika.
    *   **Zakres:** Kluczowe widoki i komponenty UI.
    *   **Narzędzia:** Playwright (`toHaveScreenshot()`), Percy, Applitools (w zależności od budżetu).
*   **Testy Kompatybilności Przeglądarek:**
    *   **Cel:** Zapewnienie poprawnego działania aplikacji na najpopularniejszych przeglądarkach.
    *   **Zakres:** Chrome, Firefox, Safari, Edge (najnowsze wersje).
    *   **Narzędzia:** Playwright (możliwość uruchamiania na różnych silnikach), BrowserStack/SauceLabs (jeśli budżet pozwoli).

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

Poniżej przedstawiono przykładowe, wysokopoziomowe scenariusze testowe. Szczegółowe przypadki testowe zostaną opracowane na ich podstawie.

### 4.1. Rejestracja i Logowanie Użytkownika (US-001, US-002)

*   **Scenariusz TC_AUTH_001: Pomyślna rejestracja nowego użytkownika.**
    *   Kroki: Wprowadź poprawne dane (email, hasło > 8 znaków, imię), zatwierdź formularz.
    *   Oczekiwany rezultat: Komunikat o pomyślnej rejestracji, użytkownik może się zalogować (po ewentualnej weryfikacji email, jeśli zaimplementowana).
*   **Scenariusz TC_AUTH_002: Rejestracja z niepoprawnymi danymi.**
    *   Kroki: Próba rejestracji z niepoprawnym formatem email, za krótkim hasłem, pustymi polami.
    *   Oczekiwany rezultat: Wyświetlenie odpowiednich komunikatów walidacyjnych przy polach.
*   **Scenariusz TC_AUTH_003: Pomyślne logowanie istniejącego użytkownika.**
    *   Kroki: Wprowadź poprawne dane logowania, zatwierdź.
    *   Oczekiwany rezultat: Użytkownik zostaje przekierowany na Dashboard (`/`).
*   **Scenariusz TC_AUTH_004: Logowanie z niepoprawnymi danymi.**
    *   Kroki: Próba logowania z błędnym hasłem lub nieistniejącym emailem.
    *   Oczekiwany rezultat: Wyświetlenie komunikatu o błędzie logowania.
*   **Scenariusz TC_AUTH_005: Resetowanie hasła (US-003).**
    *   Kroki: Użytkownik żąda resetu hasła, klika link w emailu, ustawia nowe hasło.
    *   Oczekiwany rezultat: Użytkownik może zalogować się nowym hasłem. Link resetujący jest ważny przez określony czas.

### 4.2. Zarządzanie Projektami (US-004, US-008)

*   **Scenariusz TC_PROJ_001: Tworzenie nowego projektu.**
    *   Kroki: Zalogowany użytkownik klika "Nowy Projekt", wprowadza nazwę i opcjonalny opis, zapisuje.
    *   Oczekiwany rezultat: Projekt pojawia się na liście projektów ze statusem 'new'. Użytkownik jest przekierowany na stronę szczegółów projektu.
*   **Scenariusz TC_PROJ_002: Wyświetlanie listy projektów z paginacją i wyszukiwaniem.**
    *   Kroki: Zalogowany użytkownik przechodzi na Dashboard. Testuje paginację (następna/poprzednia strona). Wpisuje frazę w pole wyszukiwania. Filtruje po statusie. Sortuje listę.
    *   Oczekiwany rezultat: Lista projektów jest poprawnie wyświetlana, paginowana (domyślnie 10), wyszukiwanie filtruje po nazwie, filtry statusu działają, sortowanie zmienia kolejność.
*   **Scenariusz TC_PROJ_003: Edycja istniejącego projektu.**
    *   Kroki: Użytkownik wybiera projekt, przechodzi do edycji, zmienia nazwę, opis, status lub inne pola. Zapisuje zmiany.
    *   Oczekiwany rezultat: Zmiany są widoczne na liście projektów i w szczegółach projektu. Pole `updated_at` jest aktualizowane.
*   **Scenariusz TC_PROJ_004: Usuwanie projektu.**
    *   Kroki: Użytkownik wybiera projekt, klika "Usuń", potwierdza operację.
    *   Oczekiwany rezultat: Projekt znika z listy projektów. Powiązane pytania AI są usuwane (CASCADE).
*   **Scenariusz TC_PROJ_005: Dostęp do projektów (RLS).**
    *   Kroki: Zaloguj się jako Użytkownik A, utwórz projekt. Zaloguj się jako Użytkownik B. Spróbuj uzyskać dostęp do projektu Użytkownika A (przez API lub bezpośredni URL, jeśli możliwe).
    *   Oczekiwany rezultat: Użytkownik B nie ma dostępu do projektu Użytkownika A. API zwraca błąd 403/404.

### 4.3. Generowanie Dokumentu PRD (US-005, US-006, US-007)

*   **Scenariusz TC_PRD_001: Rozpoczęcie generowania PRD i odpowiedzi na podstawowe pytania.**
    *   Kroki: Użytkownik wybiera projekt, klika "Utwórz dokument PRD". Wypełnia cztery podstawowe pola tekstowe. Klika "Dalej".
    *   Oczekiwany rezultat: Formularz z podstawowymi pytaniami jest wyświetlany. Przycisk "Dalej" jest aktywny po wypełnieniu wymaganych pól. Status projektu zmienia się na 'in_progress'. Odpowiedzi są zapisywane.
*   **Scenariusz TC_PRD_002: Iteracyjne pytania AI.**
    *   Kroki: Użytkownik odpowiada na kolejne pytania zadawane przez AI. Testuje opcję "Zakończ" w trakcie procesu.
    *   Oczekiwany rezultat: AI zadaje kolejne pytania. Użytkownik może zakończyć proces w dowolnym momencie. Odpowiedzi są zapisywane.
*   **Scenariusz TC_PRD_003: Generowanie i wyświetlanie PRD.**
    *   Kroki: Użytkownik klika "Zakończ" po serii pytań.
    *   Oczekiwany rezultat: Dokument PRD jest generowany (na podstawie odpowiedzi i danych projektu). Status projektu zmienia się na 'finished'. PRD jest wyświetlane i jest edytowalne.
*   **Scenariusz TC_PRD_004: Generowanie PRD z niewystarczającą ilością informacji.**
    *   Kroki: Użytkownik próbuje wygenerować PRD bez udzielenia odpowiedzi na kluczowe pytania.
    *   Oczekiwany rezultat: API zwraca błąd 422 (Unprocessable Entity) lub UI informuje o braku wystarczających danych.
*   **Scenariusz TC_PRD_005: Integracja z OpenRouter.ai – obsługa błędów.**
    *   Kroki: Symuluj błąd odpowiedzi z OpenRouter.ai (np. timeout, błąd 500).
    *   Oczekiwany rezultat: Aplikacja poprawnie obsługuje błąd, wyświetla komunikat, ewentualnie używa logiki fallback (pytania statyczne).

### 4.4. Testy automatycznego zapisu (`useAutoSave`)

*   **Scenariusz TC_AS_001: Automatyczny zapis podczas edycji pól projektu/odpowiedzi na pytania.**
    *   Kroki: Użytkownik edytuje pole (np. opis projektu, odpowiedź na pytanie AI), odczekuje chwilę (debounceTime).
    *   Oczekiwany rezultat: Dane są automatycznie zapisywane na backendzie. Wyświetlane jest powiadomienie o zapisie (jeśli skonfigurowane).
*   **Scenariusz TC_AS_002: Brak zapisu, gdy nie ma zmian.**
    *   Kroki: Użytkownik otwiera formularz, nie wprowadza zmian.
    *   Oczekiwany rezultat: Funkcja zapisu nie jest wywoływana.

## 5. Środowisko Testowe

*   **Środowisko Deweloperskie (Lokalne):**
    *   Node.js v22.14.0 (zgodnie z `.nvmrc`).
    *   npm.
    *   Lokalna instancja Supabase (uruchamiana przez Supabase CLI).
    *   Przeglądarki: Chrome (głównie), Firefox.
*   **Środowisko Staging (Jeśli dostępne):**
    *   Osobna instancja aplikacji wdrożona na VPS (Docker).
    *   Osobna instancja Supabase (lub dedykowany schemat/projekt w Supabase Cloud).
    *   Konfiguracja zbliżona do produkcyjnej.
*   **Środowisko Produkcyjne:**
    *   Testy typu smoke test po każdym wdrożeniu.
    *   Monitoring.

**Dane Testowe:**

*   Zestawy danych użytkowników (różne role, jeśli będą w przyszłości).
*   Zestawy danych projektów (różne statusy, z wypełnionymi i pustymi polami, duża ilość projektów dla testów paginacji/wydajności).
*   Zestawy danych pytań i odpowiedzi AI.
*   Dane do testowania przypadków brzegowych i walidacji (np. bardzo długie teksty, znaki specjalne).

## 6. Narzędzia do Testowania

*   **Framework do Testów E2E i API:** Playwright (zgodnie z `.windsurfrules` i `ai/prd.md`).
*   **Framework do Testów Jednostkowych i Integracyjnych (JS/TS/Vue):** Vitest.
*   **Biblioteka do Testowania Komponentów Vue:** Vue Testing Library.
*   **Narzędzia do Testów Wydajnościowych:** k6, narzędzia deweloperskie przeglądarek.
*   **Narzędzia do Testów Dostępności:** axe-core (zintegrowane z Playwright), Lighthouse.
*   **Narzędzia do Testów Wizualnych:** Playwright (`toHaveScreenshot()`).
*   **System Zarządzania Testami (opcjonalnie):** TestRail, Xray (jeśli budżet pozwoli, dla większych projektów). Początkowo może wystarczyć dokumentacja w Markdown lub arkusze kalkulacyjne.
*   **System Śledzenia Błędów:** GitHub Issues (zgodnie z README).
*   **CI/CD:** GitHub Actions.
*   **Narzędzia Deweloperskie Przeglądarek:** Do inspekcji, debugowania, analizy wydajności.
*   **Supabase Studio:** Do zarządzania i inspekcji danych w bazie Supabase.
*   **Postman/Insomnia:** Do manualnego testowania API i eksploracji.

## 7. Harmonogram Testów

Harmonogram testów powinien być zintegrowany z cyklem rozwojowym projektu (status: "in development").

*   **Testy Jednostkowe i Integracyjne:** Pisane na bieżąco przez deweloperów w trakcie implementacji nowych funkcjonalności i refaktoryzacji. Powinny być częścią definicji "ukończenia" zadania.
*   **Testy E2E i API:** Rozwijane równolegle z implementacją kluczowych przepływów użytkownika. Uruchamiane regularnie w CI.
*   **Testy Regresyjne:** Uruchamiane przed każdym wydaniem/wdrożeniem na środowisko Staging/Produkcyjne.
*   **Testy Wydajnościowe, Bezpieczeństwa, Użyteczności, Dostępności:** Planowane jako osobne fazy po zaimplementowaniu większości kluczowych funkcjonalności, przed większymi wydaniami.
*   **Faza Testów Akceptacyjnych Użytkownika (UAT):** Przed finalnym wdrożeniem, z udziałem klienta lub wybranych użytkowników.

Dokładne daty będą zależeć od postępów w rozwoju projektu. Należy dążyć do ciągłego testowania.

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia (Rozpoczęcia Testów):

*   Kod źródłowy jest dostępny w repozytorium.
*   Aplikacja jest możliwa do zbudowania i uruchomienia w środowisku testowym.
*   Dokumentacja (README, PRD, API Plan) jest dostępna i aktualna.
*   Kluczowe funkcjonalności do testowania są zaimplementowane.
*   Środowisko testowe jest skonfigurowane i stabilne.

### 8.2. Kryteria Wyjścia (Zakończenia Testów / Wydania):

*   Wszystkie zaplanowane przypadki testowe dla danego cyklu/wydania zostały wykonane.
*   Określony procent przypadków testowych zakończył się sukcesem (np. 95% dla krytycznych i wysokich priorytetów, 85% dla średnich).
*   Wszystkie błędy o priorytecie krytycznym (Blocker) i wysokim (Critical) zostały naprawione i retestowane pomyślnie.
*   Liczba otwartych błędów o średnim i niskim priorytecie jest akceptowalna i udokumentowana.
*   Dokumentacja testowa (raporty z testów, lista błędów) jest kompletna i zaktualizowana.
*   Testy regresyjne zakończyły się sukcesem.
*   Spełnione zostały metryki sukcesu zdefiniowane w PRD (jeśli mierzalne na danym etapie).

## 9. Role i Odpowiedzialności w Procesie Testowania

*   **Inżynier QA (Ty):**
    *   Tworzenie i utrzymanie planu testów.
    *   Projektowanie i implementacja przypadków testowych (manualnych i automatycznych).
    *   Wykonywanie testów (wszystkich typów).
    *   Raportowanie i śledzenie błędów.
    *   Analiza wyników testów i przygotowywanie raportów.
    *   Współpraca z deweloperami w celu rozwiązywania problemów.
    *   Utrzymanie i rozwój frameworka do automatyzacji testów.
    *   Promowanie kultury jakości w zespole.
*   **Deweloperzy:**
    *   Pisanie testów jednostkowych i integracyjnych dla swojego kodu.
    *   Naprawianie zgłoszonych błędów.
    *   Uczestnictwo w przeglądach kodu pod kątem testowalności.
    *   Wsparcie Inżyniera QA w diagnozowaniu problemów.
*   **Project Manager / Product Owner (Jeśli obecny):**
    *   Definiowanie wymagań i kryteriów akceptacji.
    *   Priorytetyzacja błędów.
    *   Uczestnictwo w Testach Akceptacyjnych Użytkownika (UAT).
    *   Podejmowanie decyzji o wydaniu na podstawie wyników testów.

## 10. Procedury Raportowania Błędów

Błędy będą raportowane i śledzone przy użyciu **GitHub Issues**.

Każdy zgłoszony błąd powinien zawierać następujące informacje:

*   **Tytuł:** Krótki, zwięzły opis problemu.
*   **Opis:** Szczegółowy opis błędu, w tym:
    *   Kroki do odtworzenia (numerowane, precyzyjne).
    *   Obserwowany rezultat.
    *   Oczekiwany rezultat.
*   **Środowisko:** Wersja aplikacji, przeglądarka (wersja), system operacyjny, specyficzne dane testowe użyte.
*   **Priorytet:** (np. Blocker, Critical, Major, Minor, Trivial) - określa wpływ błędu na działanie aplikacji i pilność naprawy.
    *   *Blocker:* Uniemożliwia dalsze testowanie kluczowych funkcjonalności.
    *   *Critical:* Poważny błąd w kluczowej funkcjonalności, brak obejścia.
    *   *Major:* Poważny błąd, ale istnieje obejście lub dotyczy mniej krytycznej funkcjonalności.
    *   *Minor:* Drobny błąd, niewielki wpływ na UX lub funkcjonalność.
    *   *Trivial:* Błąd kosmetyczny, literówka.
*   **Dotkliwość (Severity):** (np. Krytyczna, Wysoka, Średnia, Niska) - określa techniczny wpływ błędu.
*   **Zrzuty ekranu / Nagrania wideo:** Jeśli to możliwe i pomocne.
*   **Logi:** Fragmenty logów aplikacji lub konsoli przeglądarki, jeśli relevantne.
*   **Przypisanie:** Do kogo błąd jest przypisany (początkowo może być nieprzypisany lub do Inżyniera QA w celu weryfikacji).
*   **Etykiety (Labels):** Np. `bug`, `ui`, `api`, `auth`, `performance`, nazwa modułu.

**Cykl Życia Błędu:**

1.  **New/Open:** Zgłoszony błąd, oczekuje na weryfikację.
2.  **Assigned/In Progress:** Błąd zweryfikowany, przypisany do dewelopera, trwają prace nad naprawą.
3.  **Resolved/Fixed:** Deweloper oznaczył błąd jako naprawiony, gotowy do retestu.
4.  **Retest/Testing:** Inżynier QA weryfikuje poprawkę.
5.  **Closed:** Poprawka zweryfikowana pomyślnie, błąd zamknięty.
6.  **Reopened:** Poprawka nieudana lub niekompletna, błąd ponownie otwarty.
7.  **Deferred/Won't Fix:** Błąd odłożony na później lub decyzja o nienaprawianiu.

Regularne spotkania (np. codzienne stand-upy lub dedykowane spotkania triage błędów) będą organizowane w celu przeglądu i priorytetyzacji zgłoszonych błędów.

</plan_testów>