from datetime import date
from decimal import Decimal
from pydantic import BaseModel


class PerDayCost(BaseModel):
    date: date
    cost: Decimal
    over_budget: bool


class BudgetBreakdown(BaseModel):
    transport: Decimal
    stay: Decimal
    activities: Decimal
    meals: Decimal


class BudgetResponse(BaseModel):
    total_estimated_cost: Decimal
    average_cost_per_day: Decimal
    breakdown: BudgetBreakdown
    per_day: list[PerDayCost]
    budget_threshold: Decimal | None
    is_over_budget: bool
