# Schemat bazy danych PostgreSQL dla Project Manager

## 1. Tabele

### Users

This table is managed by Supabase Auth

- id: UUID PRIMARY KEY
- email: VARCHAR(255) NOT NULL UNIQUE
- name: VARCHAR(255) NOT NULL
- avatar_url: VARCHAR(255)
- encrypted_password: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- confirmed_at: TIMESTAMPTZ
- notifications_enabled: BOOLEAN NOT NULL DEFAULT TRUE


### Projects
```sql
CREATE TYPE project_status AS ENUM ('new', 'in_progress', 'completed');

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status project_status NOT NULL DEFAULT 'new',
  prd JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  CONSTRAINT projects_name_not_empty CHECK (char_length(trim(name)) > 0)
);

COMMENT ON TABLE projects IS 'Tabela przechowująca projekty użytkowników';
```

### Tags
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#808080',
  
  CONSTRAINT tags_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT tags_name_user_unique UNIQUE (user_id, name)
);

COMMENT ON TABLE tags IS 'Tabela przechowująca tagi do kategoryzacji projektów';
```

### Project_Tags
```sql
CREATE TABLE project_tags (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  
  PRIMARY KEY (project_id, tag_id)
);

COMMENT ON TABLE project_tags IS 'Tabela łącząca (junction) do relacji many-to-many między projektami a tagami';
```

### AI_Interactions
```sql
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ai_interactions IS 'Tabela logująca interakcje z AI, w tym koszty';
```

### AI_Questions
```sql
CREATE TABLE ai_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT ai_questions_sequence UNIQUE (project_id, sequence_number)
);

COMMENT ON TABLE ai_questions IS 'Tabela przechowująca pytania i odpowiedzi AI w procesie generowania PRD';
```

## 2. Relacje między tabelami

- **Users (1) → Projects (N)**: Użytkownik może posiadać wiele projektów.
- **Projects (N) ↔ Tags (N)**: Projekty i tagi mają relację wiele-do-wielu poprzez tabelę Project_Tags.
- **Users (1) → AI_Interactions (N)**: Użytkownik może mieć wiele interakcji z AI.
- **Projects (1) → AI_Interactions (N)**: Projekt może mieć wiele interakcji z AI.
- **Projects (1) → AI_Questions (N)**: Projekt może mieć wiele pytań AI w sekwencji.

## 3. Indeksy

```sql
-- Indeksy dla wyszukiwania i filtrowania projektów
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_name ON projects(name);

-- Indeksy dla tagów
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag_id ON project_tags(tag_id);

-- Indeksy dla interakcji z AI
CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_project_id ON ai_interactions(project_id);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at);

-- Indeksy dla pytań AI
CREATE INDEX idx_ai_questions_project_id ON ai_questions(project_id);
CREATE INDEX idx_ai_questions_sequence ON ai_questions(project_id, sequence_number);
```

## 4. Row Level Security (RLS)

```sql
-- Włączenie RLS dla wszystkich tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_questions ENABLE ROW LEVEL SECURITY;

-- Polityki RLS - użytkownicy mogą widzieć tylko swoje dane
CREATE POLICY users_policy ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY projects_policy ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Tagi należą do konkretnych użytkowników
CREATE POLICY tags_policy ON tags
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY project_tags_policy ON project_tags
  FOR ALL USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY ai_interactions_policy ON ai_interactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY ai_questions_policy ON ai_questions
  FOR ALL USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));
```

## 5. Funkcje i Triggery

### Aktualizacja znacznika czasu

```sql
-- Funkcja do aktualizacji pola updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla tabeli projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

### Automatyczne powiadomienia

```sql
-- Funkcja do tworzenia powiadomień po zakończeniu generowania PRD
CREATE OR REPLACE FUNCTION create_prd_completion_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
    INSERT INTO notifications (user_id, project_id, content)
    VALUES (
      NEW.user_id,
      NEW.id,
      'Dokument PRD dla projektu "' || NEW.name || '" został wygenerowany.'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla powiadomień o zakończeniu generowania PRD
CREATE TRIGGER project_completion_notification
AFTER UPDATE ON projects
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status = 'in_progress')
EXECUTE FUNCTION create_prd_completion_notification();
```

## 6. Funkcje pomocnicze

```sql
-- Funkcja do pobierania projektów wraz z tagami
CREATE OR REPLACE FUNCTION get_projects_with_tags(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  status TEXT,
  tags JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.created_at,
    p.updated_at,
    p.status::TEXT,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', t.id,
            'name', t.name,
            'color', t.color
          )
        )
        FROM project_tags pt
        JOIN tags t ON pt.tag_id = t.id
        WHERE pt.project_id = p.id
      ),
      '[]'::jsonb
    ) AS tags
  FROM
    projects p
  WHERE
    p.user_id = user_uuid
  ORDER BY
    p.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Funkcja do pobierania sekwencji pytań AI dla projektu
CREATE OR REPLACE FUNCTION get_ai_question_sequence(project_uuid UUID)
RETURNS TABLE (
  id UUID,
  sequence_number INTEGER,
  question TEXT,
  answer TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.sequence_number,
    q.question,
    q.answer,
    q.created_at
  FROM
    ai_questions q
  WHERE
    q.project_id = project_uuid
  ORDER BY
    q.sequence_number ASC;
END;
$$ LANGUAGE plpgsql;
```

## 7. Uwagi projektowe

1. **Skalowalność**: Schemat został zaprojektowany z myślą o skalowalności, z odpowiednimi indeksami dla częstych operacji wyszukiwania i filtrowania.

2. **Bezpieczeństwo**: Row Level Security (RLS) zapewnia, że użytkownicy mogą uzyskać dostęp tylko do własnych danych. Supabase automatycznie obsługuje uwierzytelnianie i zarządzanie sesjami.

3. **Format JSONB dla dokumentów PRD**: Użycie typu JSONB dla pola prd w tabeli projects zapewnia elastyczność w strukturze dokumentu, umożliwiając łatwe rozszerzanie i modyfikowanie formatu PRD w przyszłości.

4. **Tagowanie projektów**: System tagów umożliwia kategoryzację projektów. Relacja wiele-do-wielu pozwala na przypisywanie wielu tagów do projektów i używanie tego samego taga dla wielu projektów.

5. **Śledzenie interakcji AI**: Tabele ai_interactions i ai_questions pozwalają na szczegółowe śledzenie wszystkich interakcji z AI, w tym kosztów oraz pytań i odpowiedzi.

6. **Powiadomienia**: System powiadomień jest zaprojektowany do przechowywania powiadomień bez limitu czasowego. Trigger automatycznie generuje powiadomienia po zakończeniu generowania PRD.

7. **Status projektów**: Typ enum project_status zapewnia precyzyjne śledzenie stanu projektu.

Schemat bazy danych jest zgodny z wymaganiami określonymi w PRD i notatkach z sesji, a także zoptymalizowany pod kątem integracji z Supabase.