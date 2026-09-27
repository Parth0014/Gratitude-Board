-- Product metadata only. Media bytes and canvas geometry do not belong here.
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub text NOT NULL UNIQUE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 160),
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared')),
  entry_mode text NOT NULL CHECK (entry_mode IN ('reflect', 'visual')),
  current_version integer NOT NULL DEFAULT 0 CHECK (current_version >= 0),
  canvas_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX boards_owner_updated_idx ON boards(owner_id, updated_at DESC, id);

-- Ownership is canonical on boards; this table only grants additional access.
CREATE TABLE board_members (
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('editor', 'viewer')),
  PRIMARY KEY (board_id, user_id)
);
CREATE INDEX board_members_user_board_idx ON board_members(user_id, board_id);

CREATE TABLE vision_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 160),
  status text NOT NULL DEFAULT 'exploring' CHECK (status IN ('exploring', 'active', 'paused', 'evolving', 'completed', 'released')),
  is_hero boolean NOT NULL DEFAULT false,
  meaning jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(meaning) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vision_items_board_idx ON vision_items(board_id, id);

CREATE TABLE board_versions (
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version > 0),
  schema_version integer NOT NULL CHECK (schema_version > 0),
  snapshot jsonb NOT NULL,
  semantic_snapshot jsonb NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (board_id, version)
);
