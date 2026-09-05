from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    sku: str
    name: str
    category: str
    unit: str = "MT"
    weight_per_unit_kg: int = 1000
    temperature_zone: str = "AMBIENT"
    shelf_life_days: int = 365
    description: str | None = None
    reorder_threshold: int = 10


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    unit: str | None = None
    weight_per_unit_kg: int | None = None
    temperature_zone: str | None = None
    shelf_life_days: int | None = None
    description: str | None = None
    reorder_threshold: int | None = None


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    category: str
    unit: str
    weight_per_unit_kg: int
    temperature_zone: str
    shelf_life_days: int
    description: str | None = None
    reorder_threshold: int
