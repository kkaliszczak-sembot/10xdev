# Schemat bazy danych - Project Manager

## 1. Tabele

### Tabela: users
This table is managed by Supabase Auth.

- id: UUID PRIMARY KEY

- email: VARCHAR(255) NOT NULL UNIQUE

- encrypted_password: VARCHAR NOT NULL

- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

- confirmed_at: TIMESTAMPTZ

### Tabela: projects
| Kolumna           | Typ danych       | Atrybuty                      | Opis                                                  |
|-------------------|------------------|-------------------------------|-------------------------------------------------------|
| id                | uuid             | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unikalne ID projektu                         |
| user_id           | uuid             | NOT NULL, REFERENCES users(id) | Właściciel projektu                                  |
| name              | text             | NOT NULL                      | Nazwa projektu                                        |
| description       | text             |                               | Opis projektu                                         |
| status            | project_status   | NOT NULL, DEFAULT 'new'       | Status projektu (enum: new, in_progress, finished)    |
| main_problem      | text             |                               | Główny problem, który rozwiązuje projekt              |
| min_feature_set   | text             |                               | Minimalny zestaw funkcjonalności                      |
| out_of_scope      | text             |                               | Co nie wchodzi w zakres MVP                           |
| success_criteria  | text             |                               | Kryteria sukcesu projektu                             |
| prd               | text             |                               | Wygenerowany dokument PRD                             |
| created_at        | timestamptz      | NOT NULL, DEFAULT NOW()       | Data utworzenia projektu                              |
| updated_at        | timestamptz      | NOT NULL, DEFAULT NOW()       | Data ostatniej aktualizacji projektu                  |

### Tabela: ai_questions
| Kolumna           | Typ danych       | Atrybuty                      | Opis                                                  |
|-------------------|------------------|-------------------------------|-------------------------------------------------------|
| id                | uuid             | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unikalne ID pytania AI                       |
| project_id        | uuid             | NOT NULL, REFERENCES projects(id) ON DELETE CASCADE | ID projektu                     |
| question          | text             | NOT NULL                      | Pytanie zadane przez AI                               |
| answer            | text             | NOT NULL                      | Odpowiedź użytkownika                                 |
| sequence_number   | integer          | NOT NULL                      | Numer sekwencyjny pytania w procesie iteracyjnym      |
| created_at        | timestamptz      | NOT NULL, DEFAULT NOW()       | Data utworzenia pary pytanie-odpowiedź                |

## 2. Enumy

```sql
CREATE TYPE project_status AS ENUM ('new', 'in_progress', 'finished');
```

## 3. Indeksy

```sql
-- Indeks dla wyszukiwania projektów po user_id
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Indeks dla wyszukiwania projektów po nazwie (dla efektywnego filtrowania)
CREATE INDEX idx_projects_name ON projects(name);

-- Indeks dla wyszukiwania projektów po statusie
CREATE INDEX idx_projects_status ON projects(status);

-- Indeks dla wyszukiwania pytań AI po project_id
CREATE INDEX idx_ai_questions_project_id ON ai_questions(project_id);

-- Indeks dla sortowania pytań AI po sequence_number
CREATE INDEX idx_ai_questions_sequence ON ai_questions(project_id, sequence_number);
```

## 4. Triggery

```sql
-- Trigger aktualizujący updated_at przy każdej zmianie projektu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## 5. Row Level Security (RLS)

```sql
-- Włączenie RLS dla tabeli users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Polityka RLS dla tabeli users
CREATE POLICY users_policy ON users
    USING (id = auth.uid());

-- Włączenie RLS dla tabeli projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Polityka RLS dla tabeli projects - użytkownicy mogą widzieć tylko swoje projekty
CREATE POLICY projects_select_policy ON projects FOR SELECT
    USING (user_id = auth.uid());

-- Polityka RLS dla tabeli projects - użytkownicy mogą dodawać tylko swoje projekty
CREATE POLICY projects_insert_policy ON projects FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Polityka RLS dla tabeli projects - użytkownicy mogą aktualizować tylko swoje projekty
CREATE POLICY projects_update_policy ON projects FOR UPDATE
    USING (user_id = auth.uid());

-- Polityka RLS dla tabeli projects - użytkownicy mogą usuwać tylko swoje projekty
CREATE POLICY projects_delete_policy ON projects FOR DELETE
    USING (user_id = auth.uid());

-- Włączenie RLS dla tabeli ai_questions
ALTER TABLE ai_questions ENABLE ROW LEVEL SECURITY;

-- Polityka RLS dla tabeli ai_questions - powiązanie pytań z projektami użytkownika
CREATE POLICY ai_questions_select_policy ON ai_questions FOR SELECT
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY ai_questions_insert_policy ON ai_questions FOR INSERT
    WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY ai_questions_update_policy ON ai_questions FOR UPDATE
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY ai_questions_delete_policy ON ai_questions FOR DELETE
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
```

## 6. Funkcje

```sql
-- Funkcja do pobierania sekwencji pytań AI dla projektu
CREATE OR REPLACE FUNCTION get_ai_question_sequence(project_id_param uuid)
RETURNS TABLE (
    id uuid,
    question text,
    answer text,
    sequence_number integer,
    created_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        aq.id,
        aq.question,
        aq.answer,
        aq.sequence_number,
        aq.created_at
    FROM
        ai_questions aq
    WHERE
        aq.project_id = project_id_param
    ORDER BY
        aq.sequence_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 7. Relacje między tabelami

1. **users ⟷ projects** (one-to-many):
   - Jeden użytkownik może mieć wiele projektów
   - Każdy projekt należy do jednego użytkownika

2. **projects ⟷ ai_questions** (one-to-many):
   - Jeden projekt może mieć wiele pytań AI
   - Każde pytanie AI jest związane z jednym projektem

## 8. Uwagi dotyczące implementacji

1. **Integracja z auth.users Supabase**:
   - Tabela `users` jest powiązana z wbudowanym systemem autentykacji Supabase poprzez kolumnę `id`
   - Przy rejestracji nowego użytkownika należy utworzyć odpowiedni rekord w tabeli `users`

2. **Obsługa typów w TypeScript**:
   - Użyj Supabase CLI do automatycznego generowania typów TypeScript dla tabel bazy danych
   - Wszystkie typy powinny być eksportowane z jednego pliku dla ułatwienia importu

3. **Migracje**:
   - Użyj Supabase Migrations do zarządzania schematem bazy danych
   - Wszystkie zmiany w schemacie powinny być zapisywane jako migracje

4. **Wydajność**:
   - Dla projektów z dużą liczbą pytań AI, warto rozważyć paginację wyników zapytań
   - Indeksy są skonfigurowane dla najczęstszych operacji wyszukiwania i filtrowania

5. **Zabezpieczenia**:
   - Wszystkie tabele są zabezpieczone za pomocą RLS, co zapewnia dostęp tylko do własnych danych
   - Funkcje używają klauzuli SECURITY DEFINER, aby zapewnić odpowiednie uprawnienia

6. **Obsługa statusu projektu**:
   - Typ enum `project_status` ogranicza wartości do: 'new', 'in_progress', 'finished'
   - Status projektu powinien być aktualizowany podczas procesu generowania PRD
