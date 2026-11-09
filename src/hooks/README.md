# src/hooks/

Reusable React hooks, extracted only when a second consumer appears.

## Why this directory is empty

There is exactly one candidate today: `useAutoDismiss`, which lives inside
`src/features/paimon/paimon-quick-menu.tsx` and is used by one component. It sets a
timer, restarts the timer on interaction, and calls back when it expires.

It stays where it is on purpose. A hook used once is a local detail of the feature
that owns it; promoting it to a shared directory makes the codebase look more
modular than it is, and the requirement this repository was written against says
as much — organise for the code that exists, not for the diagram.

## When to move something here

Move a hook when a second, unrelated feature imports it. At that point it also
needs:

- `"use client"` at the top of the file, since a hook cannot be used from a
  server component;
- no imports from `src/features/*`, because a shared hook that depends on one
  feature is not shared;
- a name that says what it does, not where it came from.
