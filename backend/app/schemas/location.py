from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ── Warehouse ────────────────────────────────────────────────────────


class WarehouseCreate(BaseModel):
    warehouse_code: str
    name: str
    facility_type: str = "WAREHOUSE"
    status: str = "ACTIVE"
    city: str
    state: str
    address: str
    latitude: float
    longitude: float
    total_capacity_mt: int
    used_capacity_mt: int = 0
    available_capacity_mt: int = 0
    utilization_pct: float = 0.0
    point_of_contact_name: str
    point_of_contact_phone: str
    point_of_contact_email: str
    facility_tags: str | None = None
    feasibility_note: str | None = None
    vendor_id: str | None = None


class WarehouseUpdate(BaseModel):
    name: str | None = None
    facility_type: str | None = None
    status: str | None = None
    city: str | None = None
    state: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    total_capacity_mt: int | None = None
    used_capacity_mt: int | None = None
    available_capacity_mt: int | None = None
    utilization_pct: float | None = None
    point_of_contact_name: str | None = None
    point_of_contact_phone: str | None = None
    point_of_contact_email: str | None = None
    facility_tags: str | None = None
    feasibility_note: str | None = None
    vendor_id: str | None = None


class WarehouseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    warehouse_code: str
    name: str
    facility_type: str
    status: str
    city: str
    state: str
    address: str
    latitude: float
    longitude: float
    total_capacity_mt: int
    used_capacity_mt: int
    available_capacity_mt: int
    utilization_pct: float
    point_of_contact_name: str
    point_of_contact_phone: str
    point_of_contact_email: str
    facility_tags: str | None = None
    feasibility_note: str | None = None
    vendor_id: str | None = None
    created_at: datetime
    updated_at: datetime


class WarehouseCapacity(BaseModel):
    warehouse_id: int
    warehouse_code: str
    name: str
    total_capacity: int
    used_capacity: int
    available_capacity: int
    utilization_pct: float


# ── Row / Bin ────────────────────────────────────────────────────────


class RowCreate(BaseModel):
    warehouse_id: int
    label: str


class RowRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    warehouse_id: int
    label: str


class BinCreate(BaseModel):
    row_id: int
    label: str
    location_code: str


class BinRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    row_id: int
    label: str
    location_code: str
