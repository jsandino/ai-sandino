# Heuristics

*Harness-engineering ideas worth remembering — keep them somewhere visible.*

```{=latex}
\vspace{1em}
```

---

```{=latex}
\vspace{1em}
```

**1. map vs. territory** — `CLAUDE.md` routes; `docs/` knows. Don't conflate the system of engagement with the system of record.

```{=latex}
\vfill
```

**2. progressive disclosure** — load only what the current task needs. Context isn't free, and more isn't better.

```{=latex}
\vfill
```

**3. mechanical enforcement** — if a rule matters, make it mechanical. Prose drifts, checks don't.

```{=latex}
\vfill
```

**4. skills vs. docs** — skills are for workflows; docs are for knowledge. The wrong mechanism is worse than no mechanism.

```{=latex}
\vfill
```

**5. earn the check** — coverage is cheap, false positives are not. Every mechanical check has to earn its slot or it trains you to ignore failures.

```{=latex}
\vfill
```

**6. errors as remediation** — error messages are instructions written for the next agent. If a human (or model) can't act on the message, the check isn't done.

```{=latex}
\vfill
```

**7. fast feedback wins** — pre-commit beats CI for the same check. The earlier a violation surfaces, the cheaper it is to fix.

```{=latex}
\vfill
```

**8. immutable decisions** — ADRs are append-only. Supersede with a new record; never edit history.

```{=latex}
\vfill
```

**9. sub-agents as firewalls** — delegate research and investigation so the implementation context stays clean. Context discipline is the point, not the second agent.

```{=latex}
\vfill
```

**10. watch the loop** — the first iterations of any autonomous loop tell you whether your harness holds. The harness fails where you aren't looking.

```{=latex}
\vfill
```

**11. compound the fixes** — every agent mistake is a harness improvement waiting to be made. Failure modes should compound, not recur.

```{=latex}
\vfill
```

**12. project as source of truth** — not the chat, not the agent, not the prompt. The repo outlives the session, the model, and the conversation.
