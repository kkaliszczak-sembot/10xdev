# Architektura UI dla Project Manager

## 1. Przegląd struktury UI

Architektura UI dla Project Manager jest oparta na strukturze stronowej (page-based) z wykorzystaniem Astro dla głównych widoków i Vue dla komponentów interaktywnych. Aplikacja ma dwa główne układy:

- **Układ dla niezalogowanych użytkowników**: Prosty, centralnie wyrównany układ z formularzami uwierzytelniania.
- **Układ dla zalogowanych użytkowników**: Pełny układ aplikacji z nawigacją boczną po lewej stronie i głównym obszarem treści.

Ogólna struktura aplikacji jest podzielona na sekcje odpowiadające głównym funkcjonalnościom: autentykacja, zarządzanie projektami i generowanie PRD za pomocą AI.

## 2. Lista widoków

### Autentykacja

#### Logowanie (Login)
- **Ścieżka**: `/login`
- **Główny cel**: Umożliwienie istniejącym użytkownikom zalogowania się do aplikacji.
- **Kluczowe informacje**: Formularz logowania z polami email i hasło, link do resetowania hasła, link do rejestracji.
- **Kluczowe komponenty**: Formularz logowania, przyciski akcji, linki nawigacyjne.
- **UX, dostępność i względy bezpieczeństwa**: 
  - Walidacja formularza w czasie rzeczywistym.
  - Wyraźne komunikaty błędów.
  - Zabezpieczenie przed atakami typu brute force poprzez ograniczenie prób logowania.
  - Dostępność z klawiatury dla wszystkich elementów formularza.

#### Rejestracja (Register)
- **Ścieżka**: `/register`
- **Główny cel**: Umożliwienie nowym użytkownikom utworzenia konta.
- **Kluczowe informacje**: Formularz rejestracji z polami email, hasło, imię.
- **Kluczowe komponenty**: Formularz rejestracji, przyciski akcji, linki nawigacyjne.
- **UX, dostępność i względy bezpieczeństwa**: 
  - Walidacja formatu email.
  - Walidacja siły hasła (min. 8 znaków).
  - Podwójne potwierdzenie hasła.
  - Dostępność z klawiatury dla wszystkich elementów formularza.

#### Reset hasła (Password Reset)
- **Ścieżka**: `/reset-password`
- **Główny cel**: Umożliwienie użytkownikom zresetowania zapomnianego hasła.
- **Kluczowe informacje**: Formularz do wprowadzenia adresu email, informacja o wysłaniu linku resetującego.
- **Kluczowe komponenty**: Formularz wprowadzania email, przycisk akcji, link powrotu do logowania.
- **UX, dostępność i względy bezpieczeństwa**: 
  - Jasne komunikaty potwierdzające wysłanie linku do resetu hasła.
  - Ograniczenie czasowe ważności linku do 24 godzin.
  - Dostępność z klawiatury dla wszystkich elementów formularza.

#### Potwierdzenie zmiany hasła (Password Reset Confirmation)
- **Ścieżka**: `/reset-password-confirm`
- **Główny cel**: Umożliwienie użytkownikom ustawienia nowego hasła po kliknięciu w link resetujący.
- **Kluczowe informacje**: Formularz do wprowadzenia nowego hasła i jego potwierdzenia.
- **Kluczowe komponenty**: Formularz wprowadzania nowego hasła, przycisk akcji.
- **UX, dostępność i względy bezpieczeństwa**: 
  - Walidacja siły nowego hasła.
  - Dostępność z klawiatury dla wszystkich elementów formularza.

### Zarządzanie projektami

#### Dashboard
- **Ścieżka**: `/` (strona główna dla zalogowanych użytkowników)
- **Główny cel**: Prezentacja paginowanej listy projektów użytkownika z możliwością filtrowania i wyszukiwania.
- **Kluczowe informacje**: Lista projektów z nazwą, opisem, datą utworzenia, statusem; paginacja; filtry wyszukiwania.
- **Kluczowe komponenty**: 
  - Lista projektów (karty projektu).
  - Paginacja.
  - Pasek wyszukiwania.
  - Filtry statusu projektu.
  - Przycisk tworzenia nowego projektu.
- **UX, dostępność i względy bezpieczeństwa**: 
  - Kolorowe oznaczenia statusu projektu dla szybkiej identyfikacji.
  - Możliwość sortowania listy projektów.
  - Responsywny układ listy projektów.
  - Dostępność z klawiatury dla wszystkich elementów interfejsu.

#### Tworzenie nowego projektu (New Project)
- **Ścieżka**: `/projects/new`
- **Główny cel**: Umożliwienie utworzenia nowego projektu.
- **Kluczowe informacje**: Formularz z polami: nazwa projektu (wymagane) i opis (opcjonalne).
- **Kluczowe komponenty**: Formularz tworzenia projektu, przyciski akcji (Zapisz, Anuluj).
- **UX, dostępność i względy bezpieczeństwa**: 
  - Walidacja formularza w czasie rzeczywistym.
  - Automatyczne zapisywanie szkicu formularza.
  - Dostępność z klawiatury dla wszystkich elementów formularza.

#### Szczegóły projektu (Project Details)
- **Ścieżka**: `/projects/:id`
- **Główny cel**: Prezentacja szczegółowych informacji o projekcie oraz umożliwienie przejścia do generowania PRD.
- **Kluczowe informacje**: Pełne informacje o projekcie, status, data utworzenia/aktualizacji, przycisk "Utwórz dokument PRD".
- **Kluczowe komponenty**: 
  - Nagłówek projektu z nazwą i statusem.
  - Szczegóły projektu.
  - Przyciski akcji (Edytuj, Usuń, Utwórz dokument PRD).
  - Podgląd wygenerowanego PRD (jeśli istnieje).
- **UX, dostępność i względy bezpieczeństwa**: 
  - Potwierdzenie przed usunięciem projektu.
  - Wyraźne oznaczenie statusu projektu.
  - Dostępność z klawiatury dla wszystkich elementów interfejsu.

#### Edycja projektu (Edit Project)
- **Ścieżka**: `/projects/:id/edit`
- **Główny cel**: Umożliwienie edycji informacji o projekcie.
- **Kluczowe informacje**: Formularz edycji projektu z predefiniowanymi wartościami.
- **Kluczowe komponenty**: Formularz edycji projektu, przyciski akcji (Zapisz, Anuluj).
- **UX, dostępność i względy bezpieczeństwa**: 
  - Walidacja formularza w czasie rzeczywistym.
  - Automatyczne zapisywanie szkicu edycji.
  - Dostępność z klawiatury dla wszystkich elementów formularza.

### Generowanie PRD

#### Podstawowe pytania (Basic Questions)
- **Ścieżka**: `/projects/:id/prd/basic-questions`
- **Główny cel**: Zebranie podstawowych informacji niezbędnych do rozpoczęcia procesu generowania PRD.
- **Kluczowe informacje**: Formularz z czterema podstawowymi pytaniami w formie pól tekstowych (textarea).
- **Kluczowe komponenty**: 
  - Formularz z czterema polami tekstowymi.
  - Przyciski akcji (Dalej, Anuluj).
  - Wskaźnik postępu procesu.
- **UX, dostępność i względy bezpieczeństwa**: 
  - Możliwość nawigacji między polami za pomocą klawisza Enter.
  - Walidacja formularza - pytania bez odpowiedzi nie będą wysyłane.
  - Automatyczne zapisywanie szkicu odpowiedzi.
  - Dostępność z klawiatury dla wszystkich elementów formularza.

#### Pytania iteracyjne (Iterative Questions)
- **Ścieżka**: `/projects/:id/prd/iterative-questions`
- **Główny cel**: Iteracyjne zbieranie dodatkowych informacji do generowania PRD.
- **Kluczowe informacje**: Sekwencyjne pytania dotyczące szczegółów problemu, priorytetyzacji funkcji, UX, metryk sukcesu, ryzyk, harmonogramu, zasobów.
- **Kluczowe komponenty**: 
  - Formularz z pytaniem i polem na odpowiedź.
  - Przyciski akcji (Dalej, Zakończ, Anuluj).
  - Wskaźnik postępu procesu.
- **UX, dostępność i względy bezpieczeństwa**: 
  - Możliwość nawigacji za pomocą klawisza Enter.
  - Walidacja formularza - pytania bez odpowiedzi nie będą wysyłane.
  - Automatyczne zapisywanie szkicu odpowiedzi.
  - Loader wizualizujący proces generowania PRD.
  - Dostępność z klawiatury dla wszystkich elementów formularza.

#### Podgląd PRD (PRD View)
- **Ścieżka**: `/projects/:id/prd`
- **Główny cel**: Prezentacja wygenerowanego dokumentu PRD.
- **Kluczowe informacje**: Pełna treść wygenerowanego PRD w formacie tylko do odczytu.
- **Kluczowe komponenty**: 
  - Dokument PRD tylko do odczytu.
  - Przyciski akcji (Kopiuj do schowka, Powrót).
- **UX, dostępność i względy bezpieczeństwa**: 
  - Formatowanie dokumentu dla poprawy czytelności.
  - Możliwość kopiowania całego dokumentu lub jego części.
  - Dostępność z klawiatury dla wszystkich elementów interfejsu.
  - Responsywny układ dokumentu.

### Ustawienia użytkownika

#### Profil użytkownika (User Profile)
- **Ścieżka**: `/profile`
- **Główny cel**: Umożliwienie użytkownikowi zarządzania swoim kontem i profilem.
- **Kluczowe informacje**: Dane profilu użytkownika (imię, avatar, data rejestracji), opcje zarządzania kontem.
- **Kluczowe komponenty**: 
  - Formularz edycji profilu.
  - Sekcja zmiany hasła.
  - Przyciski akcji (Zapisz zmiany, Anuluj).
- **UX, dostępność i względy bezpieczeństwa**: 
  - Walidacja formularza w czasie rzeczywistym.
  - Potwierdzenie aktualnego hasła przy zmianach krytycznych danych.
  - Dostępność z klawiatury dla wszystkich elementów formularza.

## 3. Mapa podróży użytkownika

### Podstawowy przepływ dla nowego użytkownika:
1. Rejestracja: Użytkownik przechodzi do `/register`, podaje email, hasło i imię.
2. Potwierdzenie rejestracji: Użytkownik otrzymuje potwierdzenie na podany email.
3. Logowanie: Po potwierdzeniu, użytkownik przechodzi do `/login` i loguje się.
4. Dashboard: Po zalogowaniu użytkownik trafia na dashboard (`/`), gdzie widzi pustą listę projektów.
5. Tworzenie projektu: Użytkownik klika przycisk "Nowy projekt", przechodzi do `/projects/new` i tworzy swój pierwszy projekt.
6. Szczegóły projektu: Po utworzeniu projektu, użytkownik jest przekierowany do `/projects/:id` z podglądem szczegółów projektu.
7. Rozpoczęcie generowania PRD: Użytkownik klika "Utwórz dokument PRD" i przechodzi do `/projects/:id/prd/basic-questions`.
8. Odpowiedzi na podstawowe pytania: Użytkownik uzupełnia cztery podstawowe pytania i klika "Dalej".
9. Odpowiedzi na pytania iteracyjne: Użytkownik przechodzi do `/projects/:id/prd/iterative-questions` i odpowiada na kolejne pytania AI.
10. Zakończenie procesu: Użytkownik klika "Zakończ", gdy uzna, że udzielił wystarczającej ilości informacji.
11. Podgląd wygenerowanego PRD: Użytkownik jest przekierowany do `/projects/:id/prd`, gdzie widzi wygenerowany dokument.
12. Powrót do dashboardu: Użytkownik może wrócić do dashboardu i kontynuować pracę z innymi projektami.

### Przepływ dla istniejącego projektu:
1. Logowanie: Użytkownik przechodzi do `/login` i loguje się.
2. Dashboard: Po zalogowaniu, użytkownik widzi listę swoich projektów na dashboardzie (`/`).
3. Filtrowanie/wyszukiwanie: Użytkownik może filtrować i wyszukiwać projekty według nazwy lub statusu.
4. Wybór projektu: Użytkownik klika na wybrany projekt i przechodzi do `/projects/:id`.
5. Akcje na projekcie: Użytkownik może edytować, usunąć projekt lub rozpocząć/kontynuować generowanie PRD.

### Przepływ dla zarządzania kontem:
1. Dostęp do profilu: Z dowolnego widoku, użytkownik może kliknąć swoje imię/avatar w nawigacji bocznej i przejść do `/profile`.
2. Edycja profilu: Użytkownik może zmienić swoje dane profilowe.
3. Zmiana hasła: Użytkownik może przejść do sekcji zmiany hasła i wprowadzić nowe hasło.
4. Wylogowanie: Użytkownik może wylogować się z aplikacji za pomocą odpowiedniego przycisku w nawigacji.

## 4. Układ i struktura nawigacji

### Układ ogólny
- **Niezalogowani użytkownicy**: Prosty, centralnie wyrównany układ bez nawigacji.
- **Zalogowani użytkownicy**: Dwukolumnowy układ:
  - Lewa kolumna: Nawigacja boczna (około 20% szerokości ekranu).
  - Prawa kolumna: Główny obszar treści (około 80% szerokości ekranu).

### Struktura nawigacji bocznej (dla zalogowanych użytkowników)
- **Górna część**:
  - Logo i nazwa aplikacji.
  - Dashboard (strona główna).
  - Przycisk "Nowy projekt".
- **Środkowa część**:
  - Lista ostatnio przeglądanych projektów (szybki dostęp).
- **Dolna część**:
  - Profil użytkownika (imię, avatar).
  - Wylogowanie.

### Nawigacja kontekstowa
- **Breadcrumbs**: Na każdej podstronie poza dashboardem, dla ułatwienia orientacji i nawigacji.
- **Przyciski akcji**: Kontekstowe przyciski akcji umieszczone w prawym górnym rogu głównego obszaru treści.
- **Nawigacja wstecz**: Przyciski powrotu do poprzedniego widoku.

### Nawigacja mobilna
- Na urządzeniach mobilnych, nawigacja boczna zostanie zastąpiona menu hamburgerowym lub wysuwanym menu.
- Responsywny układ, który dostosowuje się do różnych rozmiarów ekranu.

## 5. Kluczowe komponenty

### Komponenty UI

#### Nawigacja
- **SideNavigation**: Nawigacja boczna dla zalogowanych użytkowników.
- **Breadcrumbs**: Ścieżka nawigacyjna pokazująca aktualną lokalizację w aplikacji.
- **MobileMenu**: Mobilne menu nawigacyjne.

#### Autentykacja
- **LoginForm**: Formularz logowania.
- **RegisterForm**: Formularz rejestracji.
- **PasswordResetForm**: Formularz resetowania hasła.
- **PasswordChangeForm**: Formularz zmiany hasła.

#### Projekty
- **ProjectCard**: Karta projektu w liście projektów.
- **ProjectList**: Lista projektów z paginacją.
- **ProjectFilters**: Filtry i wyszukiwarka projektów.
- **ProjectStatusBadge**: Kolorowy znacznik statusu projektu.
- **Pagination**: Komponent paginacji.
- **ProjectForm**: Formularz tworzenia/edycji projektu.
- **ProjectDetails**: Komponent wyświetlający szczegóły projektu.
- **DeleteConfirmation**: Okno dialogowe potwierdzenia usunięcia projektu.

#### Generowanie PRD
- **BasicQuestionsForm**: Formularz z czterema podstawowymi pytaniami.
- **IterativeQuestionsForm**: Formularz z pytaniami iteracyjnymi.
- **ProgressIndicator**: Wskaźnik postępu procesu generowania PRD.
- **PRDDocument**: Komponent wyświetlający wygenerowany dokument PRD.
- **Loader**: Wskaźnik ładowania podczas generowania PRD.

#### Elementy wspólne
- **Button**: Przycisk z różnymi wariantami (primary, secondary, danger).
- **Input**: Pole wejściowe z walidacją.
- **Textarea**: Pole tekstowe z możliwością automatycznego dostosowywania wysokości.
- **Select**: Pole wyboru z opcjami.
- **Alert**: Komponent do wyświetlania komunikatów (sukces, błąd, info).
- **Modal**: Okno modalne dla dialogów.
- **Tooltip**: Podpowiedzi dla elementów interfejsu.
- **Avatar**: Awatar użytkownika.
- **ErrorBoundary**: Komponent do obsługi błędów w interfejsie użytkownika.

### Komponenty biznesowe

#### Zarządzanie stanem
- **UserContext**: Kontekst przechowujący informacje o zalogowanym użytkowniku.
- **ProjectsStore**: Store zarządzający stanem projektów.
- **AIQuestionsStore**: Store zarządzający stanem pytań AI.
- **NotificationStore**: Store zarządzający powiadomieniami systemowymi.

#### Integracja z API
- **SupabaseClient**: Klient do interakcji z Supabase.
- **APIClient**: Klient do wykonywania zapytań do API.
- **AuthService**: Serwis obsługujący autentykację.
- **ProjectService**: Serwis obsługujący operacje na projektach.
- **PRDService**: Serwis obsługujący generowanie PRD.
