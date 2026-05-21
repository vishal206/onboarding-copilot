PLAN_LIMITS: dict[str, dict] = {
    "free": {
        "max_employees_covered": 10,
        "max_pages_indexed": 50,
        "removes_branding": False,
        "sso_enabled": False,
        "custom_domain_enabled": False,
        "chat_history_days": 30,
    },
    "starter": {
        "max_employees_covered": 50,
        "max_pages_indexed": 500,
        "removes_branding": True,
        "sso_enabled": False,
        "custom_domain_enabled": False,
        "chat_history_days": 365,
    },
    "growth": {
        "max_employees_covered": 200,
        "max_pages_indexed": 2500,
        "removes_branding": True,
        "sso_enabled": False,
        "custom_domain_enabled": False,
        "chat_history_days": 365,
    },
    "scale": {
        "max_employees_covered": 1000,
        "max_pages_indexed": 10000,
        "removes_branding": True,
        "sso_enabled": True,
        "custom_domain_enabled": True,
        "chat_history_days": None,  # unlimited
    },
}
