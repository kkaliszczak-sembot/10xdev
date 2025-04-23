# Dokument wymagań produktu (PRD) - Project Manager

## 1. Przegląd produktu

Project Manager to aplikacja webowa wspomagająca użytkowników w rozwoju pomysłów projektowych. Korzystając z integracji AI, przekształca uproszczone opisy koncepcji w szczegółowy dokument PRD.

## 2. Problem użytkownika

Użytkownicy często mają ciekawe pomysły na projekty, ale brakuje im struktury i szczegółowych informacji potrzebnych do ich realizacji. Project Manager eliminuje ten ból, prowadząc przez iteracyjny proces zadawania pytań przez AI.

## 3. Wymagania funkcjonalne

- System rejestracji i logowania (email+hasło) z profilem zawierającym imię, avatar oraz datę rejestracji.
- Zarządzanie projektami (tworzenie, odczyt, edycja, usuwanie) z polami: nazwa, opis, data utworzenia, status.
- Paginowana lista projektów z wyszukiwaniem i filtrem po nazwie.
- Interfejs generowania PRD: przycisk Utwórz dokument PRD oraz formularz z czterema polami wejściowymi (tekstowymi lub dynamicznymi listami).
- Iteracyjny silnik AI:
  1. Pierwszy krok: podstawowe cztery pytania.
  2. Kolejne kroki: pytania o szczegóły problemu, priorytetyzację funkcji, oczekiwane UX, metryki sukcesu, ryzyka, harmonogram i zasoby.
     Proces trwa aż do kliknięcia przycisku Zakończ przez użytkownika.
- Możliwość edycji wygenerowanego planu w dowolnym momencie.
- System powiadomień wewnątrz aplikacji oraz mailowy.

## 4. Granice produktu

- Brak udostępniania projektów między kontami.
- Brak obsługi multimediów (np. zdjęć).
- Aplikacja dostępna wyłącznie w wersji webowej.

## 5. Historyjki użytkowników

US-001 Rejestracja użytkownika
Opis: Użytkownik tworzy konto podając email, hasło i imię
Kryteria akceptacji:

- Formularz waliduje format email
- Hasło musi mieć min. 8 znaków
- Po rejestracji użytkownik widzi ekran powitalny

US-002 Logowanie użytkownika
Opis: Użytkownik loguje się do systemu podając email i hasło
Kryteria akceptacji:

- Poprawne dane kierują na dashboard
- Niepoprawne wyświetlają komunikat o błędzie

US-003 Resetowanie hasła
Opis: Użytkownik może zresetować hasło przez email
Kryteria akceptacji:

- Dostaje link resetujący hasło na email
- Link jest ważny przez 24h

US-004 Dodanie pomysłu na projekt
Opis: Użytkownik wprowadza nazwę i opis pomysłu
Kryteria akceptacji:

- Lista projektów odświeża się po dodaniu
- Projekt widoczny na paginowanej liście

US-005 Rozpoczęcie generowania PRD
Opis: Użytkownik klika Utwórz dokument PRD przy wybranym projekcie
Kryteria akceptacji:

- Pojawia się formularz z czterema pytaniami
- Przycisk Dalej aktywny po uzupełnieniu pól

US-006 Odpowiedzi na podstawowe pytania
Opis: Użytkownik uzupełnia pola tekstowe i listy dynamiczne
Kryteria akceptacji:

- W listach automatycznie dodaje się dodatkowy wiersz po uzupełnieniu poprzednich
- Błędy walidacji dla pustych wymaganych pól

US-007 Iteracyjne pytania AI
Opis: AI zadaje kolejne pytania dotyczące szczegółów problemu, priorytetów, UX, metryk, ryzyk, harmonogramu i zasobów
Kryteria akceptacji:

- Użytkownik widzi każde pytanie w oddzielnym ekranie
- Może zakończyć proces kliknięciem Zakończ

US-008 Edycja wygenerowanego planu
Opis: Użytkownik modyfikuje treść wygenerowanego dokumentu PRD
Kryteria akceptacji:

- Zmiany są zapisywane w projekcie

US-009 Przeglądanie listy projektów
Opis: Użytkownik przegląda swoje projekty na stronie głównej
Kryteria akceptacji:

- Lista jest paginowana co 10 pozycji
- Możliwość filtrowania i wyszukiwania po nazwie

US-010 Powiadomienia in-app
Opis: Użytkownik otrzymuje powiadomienia o ukończeniu generowania PRD
Kryteria akceptacji:

- Ikona dzwonka pokazuje liczbę nieprzeczytanych powiadomień
- Kliknięcie prowadzi do szczegółów projektu

US-011 Powiadomienia email
Opis: Użytkownik otrzymuje powiadomienie mailowe po zakończeniu generowania PRD
Kryteria akceptacji:

- Email zawiera nazwę projektu i link do dokumentu
- Email wysyłany w ciągu 5 minut od zakończenia procesu

US-012 Wylogowanie użytkownika
Opis: Użytkownik wylogowuje się z aplikacji
Kryteria akceptacji:

- Sesja użytkownika kończy się natychmiast
- Przekierowanie na stronę logowania

## 6. Metryki sukcesu

- 90% użytkowników posiada co najmniej jeden projekt
- 75% użytkowników generuje co najmniej 3 dokumenty PRD rocznie
- Średnia liczba projektów na aktywnego użytkownika
- Czas od kliknięcia Utwórz PRD do otrzymania dokumentu (cel < 2 min)
