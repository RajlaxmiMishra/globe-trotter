"""
Budget + itinerary + calendar tests.
Seeds a city + activities directly into the test DB session, then builds a
trip/stop/stop_activities via the API and verifies response shapes.
"""
import uuid
import pytest
from decimal import Decimal
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.city import City
from app.models.activity import Activity
from tests.conftest import auth_headers

pytestmark = pytest.mark.asyncio


@pytest.fixture(scope="session")
async def city(db_session: AsyncSession) -> City:
    c = City(
        id=uuid.uuid4(),
        name="TestCity",
        country="Testland",
        cost_index=50,
        popularity_score=80,
    )
    db_session.add(c)
    await db_session.commit()
    await db_session.refresh(c)
    return c


@pytest.fixture(scope="session")
async def activities(db_session: AsyncSession, city: City) -> list[Activity]:
    acts = [
        Activity(city_id=city.id, name="Sightseeing Tour", category="sightseeing",
                 cost=Decimal("30.00"), duration_minutes=120),
        Activity(city_id=city.id, name="Bus Ride", category="transport",
                 cost=Decimal("5.00"), duration_minutes=30),
        Activity(city_id=city.id, name="Hotel Stay", category="stay",
                 cost=Decimal("100.00"), duration_minutes=None),
        Activity(city_id=city.id, name="Restaurant Dinner", category="food",
                 cost=Decimal("40.00"), duration_minutes=90),
    ]
    for a in acts:
        db_session.add(a)
    await db_session.commit()
    for a in acts:
        await db_session.refresh(a)
    return acts


async def _make_trip_and_stop(client, headers, city_id):
    trip = (await client.post("/api/v1/trips", headers=headers, json={
        "name": "Budget Test Trip",
        "start_date": "2026-07-01",
        "end_date": "2026-07-03",
    })).json()
    stop = (await client.post(f"/api/v1/trips/{trip['id']}/stops", headers=headers, json={
        "city_id": str(city_id),
        "start_date": "2026-07-01",
        "end_date": "2026-07-03",
        "order_index": 0,
    })).json()
    return trip["id"], stop["id"]


async def test_budget_empty_trip(client: AsyncClient):
    headers = await auth_headers(client, "bempty@example.com")
    trip_id = (await client.post("/api/v1/trips", headers=headers, json={
        "name": "Empty", "start_date": "2026-07-01", "end_date": "2026-07-03"
    })).json()["id"]
    resp = await client.get(f"/api/v1/trips/{trip_id}/budget", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert float(data["total_estimated_cost"]) == 0.0
    assert data["is_over_budget"] is False
    assert data["budget_threshold"] is None


async def test_budget_calculation(client: AsyncClient, city: City, activities: list):
    headers = await auth_headers(client, "bcalc@example.com")
    trip_id, stop_id = await _make_trip_and_stop(client, headers, city.id)

    for act in activities:
        r = await client.post(f"/api/v1/stops/{stop_id}/activities", headers=headers, json={
            "activity_id": str(act.id),
            "scheduled_date": "2026-07-01",
        })
        assert r.status_code == 201, r.text

    data = (await client.get(f"/api/v1/trips/{trip_id}/budget", headers=headers)).json()

    assert float(data["total_estimated_cost"]) == 175.0
    assert float(data["breakdown"]["activities"]) == 30.0
    assert float(data["breakdown"]["transport"]) == 5.0
    assert float(data["breakdown"]["stay"]) == 100.0
    assert float(data["breakdown"]["meals"]) == 40.0
    assert len(data["per_day"]) == 3
    day1 = next(d for d in data["per_day"] if d["date"] == "2026-07-01")
    assert float(day1["cost"]) == 175.0


async def test_budget_threshold_over(client: AsyncClient, city: City, activities: list):
    headers = await auth_headers(client, "bover@example.com")
    trip_id, stop_id = await _make_trip_and_stop(client, headers, city.id)

    for act in activities:
        await client.post(f"/api/v1/stops/{stop_id}/activities", headers=headers, json={
            "activity_id": str(act.id), "scheduled_date": "2026-07-01",
        })

    await client.patch(f"/api/v1/trips/{trip_id}/budget-threshold", headers=headers,
                       json={"budget_threshold": 100})

    data = (await client.get(f"/api/v1/trips/{trip_id}/budget", headers=headers)).json()
    assert data["is_over_budget"] is True
    assert float(data["budget_threshold"]) == 100.0


async def test_budget_cost_override(client: AsyncClient, city: City, activities: list):
    headers = await auth_headers(client, "bover2@example.com")
    trip_id, stop_id = await _make_trip_and_stop(client, headers, city.id)

    sightseeing = activities[0]  # catalog cost = 30
    r = await client.post(f"/api/v1/stops/{stop_id}/activities", headers=headers, json={
        "activity_id": str(sightseeing.id),
        "scheduled_date": "2026-07-01",
        "cost_override": 99.00,
    })
    assert r.status_code == 201
    assert float(r.json()["cost_override"]) == 99.0

    data = (await client.get(f"/api/v1/trips/{trip_id}/budget", headers=headers)).json()
    assert float(data["total_estimated_cost"]) == 99.0
    assert float(data["breakdown"]["activities"]) == 99.0


async def test_itinerary_structure(client: AsyncClient, city: City, activities: list):
    headers = await auth_headers(client, "bitin@example.com")
    trip_id, stop_id = await _make_trip_and_stop(client, headers, city.id)

    act = activities[0]
    await client.post(f"/api/v1/stops/{stop_id}/activities", headers=headers, json={
        "activity_id": str(act.id),
        "scheduled_date": "2026-07-02",
        "scheduled_time": "10:00:00",
    })

    data = (await client.get(f"/api/v1/trips/{trip_id}/itinerary", headers=headers)).json()
    assert data["trip"]["id"] == trip_id
    assert len(data["stops"]) == 1
    day = next(d for d in data["stops"][0]["days"] if d["date"] == "2026-07-02")
    assert len(day["activities"]) == 1
    assert day["activities"][0]["name"] == "Sightseeing Tour"


async def test_calendar_covers_all_days(client: AsyncClient, city: City, activities: list):
    headers = await auth_headers(client, "bcal@example.com")
    trip_id, _ = await _make_trip_and_stop(client, headers, city.id)

    data = (await client.get(f"/api/v1/trips/{trip_id}/calendar", headers=headers)).json()
    dates = [d["date"] for d in data["days"]]
    assert len(dates) == 3
    assert "2026-07-01" in dates
    assert "2026-07-03" in dates
