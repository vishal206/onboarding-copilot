PLAN_LIMITS: dict[str, dict[str, int | None]] = {
    "free":    {"max_docs": 3,    "max_messages_per_month": 50},
    "starter": {"max_docs": 25,   "max_messages_per_month": 500},
    "growth":  {"max_docs": 100,  "max_messages_per_month": 2000},
    "scale":   {"max_docs": None, "max_messages_per_month": None},
}
