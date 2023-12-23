---
tags: wip
---

# WHY

value !!!

decorator independent

be explicit on
  async construction and/or background start
    ie: Browser controller
  session / scope of construction lifetime
  custom destruction

good #dx
  no constructor hijack
    easier to add just some DC managed fields
  easy to identify containers
    is it the global one?
    is it from a session related container?

mock nested constructions

# DOC Key uses

## browser sessions
ensure all auth dependent controllers get destroyed after logout

## backend sessions
ensure each request related object gets destroyed, never reused