CREATE TABLE teachers (
 id uuid PRIMARY KEY, login varchar(80) UNIQUE NOT NULL, password_hash varchar(200) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE classrooms (
 id uuid PRIMARY KEY, teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
 name varchar(80) NOT NULL, timezone varchar(80) NOT NULL DEFAULT 'America/Sao_Paulo', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX classrooms_owner ON classrooms(teacher_id);
CREATE TABLE students (
 id uuid PRIMARY KEY, classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
 label varchar(32) NOT NULL, code_hash varchar(64) UNIQUE NOT NULL, active boolean NOT NULL DEFAULT true,
 data jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX students_classroom ON students(classroom_id);
CREATE TABLE sessions (
 token_hash varchar(64) PRIMARY KEY, csrf varchar(80) NOT NULL,
 teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
 student_id uuid REFERENCES students(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL, CHECK ((teacher_id IS NULL) <> (student_id IS NULL))
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE events (
 student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 id uuid NOT NULL, payload_hash varchar(64) NOT NULL, result jsonb NOT NULL,
 received_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(student_id,id)
);
CREATE TABLE login_limits (
 key varchar(64) PRIMARY KEY, attempts integer NOT NULL, expires_at timestamptz NOT NULL
);
