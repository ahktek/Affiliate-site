# components/admin/

Admin-only UI primitives (shells, tables, editor surfaces, role guards).
Rendered exclusively under the `_authenticated` route subtree so admin
chunks (Tiptap, Recharts, etc.) stay out of the public bundle.
