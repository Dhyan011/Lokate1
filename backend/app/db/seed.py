"""Seed script to populate the database with hackathon-ready demo data matching frontend mocks."""

import argparse
import asyncio
from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.database import Base
from app.models.product import Product
from app.models.vendor import Vendor
from app.models.warehouse import Bin, Row, Warehouse
from app.services.movement_service import record_inward

async def reset_db(engine):
    print("Resetting database...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def seed_data(session: AsyncSession):
    print("Seeding Vendors...")
    vendors_data = [
        {"name": "ColdChain Logistics", "contact_name": "Rajesh Sharma", "contact_phone": "+91-9800001111", "contact_email": "rajesh@coldchain.in", "address": "Maharashtra"},
        {"name": "AgriStore India", "contact_name": "Priya Nair", "contact_phone": "+91-9800002222", "contact_email": "priya@agristore.in", "address": "Punjab"},
    ]
    vendors = []
    for vd in vendors_data:
        v = Vendor(**vd)
        session.add(v)
        vendors.append(v)
    await session.commit()

    print("Seeding Warehouses...")
    warehouses_data = [
        {"warehouse_code": "MH-MUM-001", "name": "Mumbai Central Cold Hub", "facility_type": "COLD_STORAGE", "status": "ACTIVE", "city": "Mumbai", "state": "Maharashtra", "address": "Plot 45, APMC Market", "latitude": 19.0760, "longitude": 72.8777, "total_capacity_mt": 12000, "used_capacity_mt": 8400, "available_capacity_mt": 3600, "utilization_pct": 70, "point_of_contact_name": "Manish Rao", "point_of_contact_phone": "+91-9871234567", "point_of_contact_email": "manish@wh1.in", "facility_tags": "cold-chain,food-grade", "feasibility_note": "Open 24/7", "vendor_id": "1"},
        {"warehouse_code": "PB-LDH-001", "name": "Ludhiana Grain Depot", "facility_type": "WAREHOUSE", "status": "ACTIVE", "city": "Ludhiana", "state": "Punjab", "address": "Focal Point, Phase 8", "latitude": 30.9010, "longitude": 75.8573, "total_capacity_mt": 25000, "used_capacity_mt": 19500, "available_capacity_mt": 5500, "utilization_pct": 78, "point_of_contact_name": "Gurpreet Kaur", "point_of_contact_phone": "+91-9823456789", "point_of_contact_email": "gurpreet@wh3.in", "facility_tags": "food-grade,WDRA", "feasibility_note": "FCI-approved", "vendor_id": "2"},
        {"warehouse_code": "MP-IND-001", "name": "Indore Central Agri Hub", "facility_type": "WAREHOUSE", "status": "ACTIVE", "city": "Indore", "state": "Madhya Pradesh", "address": "Pithampur AKVN", "latitude": 22.7196, "longitude": 75.8577, "total_capacity_mt": 20000, "used_capacity_mt": 12000, "available_capacity_mt": 8000, "utilization_pct": 60, "point_of_contact_name": "Asha Deshpande", "point_of_contact_phone": "+91-9890123456", "point_of_contact_email": "asha@wh10.in", "facility_tags": "food-grade", "feasibility_note": "Central Hub", "vendor_id": "2"},
        {"warehouse_code": "TG-HYD-001", "name": "Hyderabad Deccan Cold Hub", "facility_type": "COLD_STORAGE", "status": "ACTIVE", "city": "Hyderabad", "state": "Telangana", "address": "IDA Jeedimetla", "latitude": 17.3850, "longitude": 78.4867, "total_capacity_mt": 9500, "used_capacity_mt": 7200, "available_capacity_mt": 2300, "utilization_pct": 75.8, "point_of_contact_name": "Srinivas Reddy", "point_of_contact_phone": "+91-9800123456", "point_of_contact_email": "srinivas@wh11.in", "facility_tags": "cold-chain", "feasibility_note": "Cold storage", "vendor_id": "1"},
    ]
    
    warehouses = []
    for wd in warehouses_data:
        w = Warehouse(**wd)
        session.add(w)
        warehouses.append(w)
    await session.commit()

    # Create Rows and Bins for Ludhiana (wh[1]) to match our UI
    print("Seeding Rows and Bins...")
    w_ldh = warehouses[1]
    
    rows = []
    # R1 corresponds to Row A in frontend, R2 to Row B, etc.
    for i, lbl in enumerate(["Row A", "Row B", "Row C", "Row D", "Row E", "Row F"]):
        r = Row(warehouse_id=w_ldh.id, label=lbl)
        session.add(r)
        rows.append(r)
    await session.commit()

    # Bins for Row A
    b1 = Bin(row_id=rows[0].id, label="Bin 1", location_code="A-01-01")
    # Bins for Row B
    b2 = Bin(row_id=rows[1].id, label="Bin 2", location_code="B-03-02")
    session.add_all([b1, b2])
    await session.commit()

    print("Seeding Products...")
    products_data = [
        {"sku": "WHT-PNJ-001", "name": "Punjab Wheat (Grade A)", "category": "Grain", "unit": "MT", "weight_per_unit_kg": 1000, "temperature_zone": "AMBIENT", "shelf_life_days": 365, "description": "Premium Punjab wheat"},
        {"sku": "RIC-BAS-001", "name": "Basmati Rice (1121)", "category": "Grain", "unit": "MT", "weight_per_unit_kg": 1000, "temperature_zone": "AMBIENT", "shelf_life_days": 730, "description": "1121 Basmati rice"},
    ]
    products = []
    for pd in products_data:
        p = Product(**pd)
        session.add(p)
        products.append(p)
    await session.commit()

    print("Seeding Inventory...")
    # Ludhiana has 4200 Wheat in A-01-01
    await record_inward(session, products[0].id, b1.id, 4200, "Initial Stock Seed")
    
    # Ludhiana has 2800 Rice in B-03-02
    await record_inward(session, products[1].id, b2.id, 2800, "Initial Stock Seed")

    await session.commit()
    print("Seed complete! Created Warehouses, Rows, Bins, Products, and Initial Stock.")

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Drop and recreate all tables first")
    args = parser.parse_args()

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    
    if args.reset:
        await reset_db(engine)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        await seed_data(session)
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
