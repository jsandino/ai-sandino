# Heuristics

*Harness-engineering ideas worth remembering — keep them somewhere visible.*

---

::: spread

**1. map vs. territory** — `CLAUDE.md` routes; `docs/` knows. Don't conflate the system of engagement with the system of record.

**2. progressive disclosure** — load only what the current task needs. Context isn't free, and more isn't better.

**3. mechanical enforcement** — if a rule matters, make it mechanical. Prose drifts, checks don't.

**4. skills vs. docs** — skills are for workflows; docs are for knowledge. The wrong mechanism is worse than no mechanism.

**5. earn the check** — coverage is cheap, false positives are not. Every mechanical check has to earn its slot or it trains you to ignore failures.

**6. errors as remediation** — error messages are instructions written for the next agent. If a human (or model) can't act on the message, the check isn't done.

**7. fast feedback wins** — pre-commit beats CI for the same check. The earlier a violation surfaces, the cheaper it is to fix.

**8. immutable decisions** — ADRs are append-only. Supersede with a new record; never edit history.

**9. sub-agents as firewalls** — delegate research and investigation so the implementation context stays clean. Context discipline is the point, not the second agent.

**10. watch the loop** — the first iterations of any autonomous loop tell you whether your harness holds. The harness fails where you aren't looking.

**11. compound the fixes** — every agent mistake is a harness improvement waiting to be made. Failure modes should compound, not recur.

**12. project as source of truth** — not the chat, not the agent, not the prompt. The repo outlives the session, the model, and the conversation.

:::
