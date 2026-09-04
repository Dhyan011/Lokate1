/**
 * Shared TypeScript types matching the FastAPI backend schemas
 * PS-3 Warehouse Network
 */

// ─── Warehouse & Facilities ────────────────────────────────────────────────

export type FacilityType = 'WAREHOUSE' | 'COLD_STORAGE' | 'HYBRID';
export type FacilityStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Warehouse {
  id: string;
  warehouse_code: string;
  name: string;
  facility_type: FacilityType;
  status: FacilityStatus;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  total_capacity_mt: number;   // metric tonnes
  used_capacity_mt: number;
  available_capacity_mt: number;
  utilization_pct: number;
  point_of_contact: {
    name: string;
    phone: string;
    email: string;
  };
  facility_tags: string[];     // e.g. ['cold-chain', 'food-grade', 'government']
  feasibility_note: string;    // free-text about access, restrictions
  vendor_id: string;
  created_at: string;
  updated_at: string;
}

// ─── Products & Inventory ─────────────────────────────────────────────────

export type TemperatureZone = 'AMBIENT' | 'COOL' | 'FROZEN' | 'CONTROLLED';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;          // e.g. 'kg', 'bag', 'crate'
  weight_per_unit_kg: number;
  temperature_zone: TemperatureZone;
  shelf_life_days: number;
  description: string;
}

export interface InventoryRecord {
  id: string;
  product_id: string;
  product: Product;
  warehouse_id: string;
  warehouse: Pick<Warehouse, 'id' | 'warehouse_code' | 'name' | 'city' | 'state' | 'facility_type'>;
  bin_location: string;     // e.g. 'A-12-03'
  quantity: number;
  quantity_reserved: number;
  quantity_available: number;
  lot_number: string;
  expiry_date: string | null;
  last_updated: string;
}

// ─── Vendors ─────────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  name: string;
  logo_url?: string;
  category: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  warehouse_count: number;
  states_covered: string[];
  certifications: string[];
}

// ─── Orders ──────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface OrderLineItem {
  sku: string;
  quantity: number;
  product?: Product;
}

export interface OrderRequest {
  line_items: OrderLineItem[];
  origin_lat?: number;
  origin_lng?: number;
  origin_city?: string;
  delivery_address: string;
  required_date?: string;
  notes?: string;
}

export interface WarehouseCandidate {
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
  available_quantity: number;
  can_fully_fulfill: boolean;
  distance_km: number | null;
  duration_minutes: number | null;
  weather_adjusted_eta_minutes: number | null;
  score: number | null;
  reason: string | null;
}

export interface LineItemFulfillment {
  product_id: number;
  sku: string;
  requested_quantity: number;
  top_pick: WarehouseCandidate | null;
  alternatives: WarehouseCandidate[];
}

export interface OrderRead {
  id: number;
  status: OrderStatus;
  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;
  created_at: string;
  updated_at: string;
  line_items: any[];
}

export interface OrderResponse {
  order: OrderRead;
  fulfillment: LineItemFulfillment[];
}

// ─── Deliveries ───────────────────────────────────────────────────────────

export type DeliveryStatus = 'PENDING' | 'IN_TRANSIT' | 'DELAYED' | 'DELIVERED' | 'FAILED';

export interface TrackingEvent {
  timestamp: string;
  location: string;
  latitude: number;
  longitude: number;
  status: DeliveryStatus;
  note: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  vehicle_number: string;
  driver_name: string;
  status: DeliveryStatus;
  origin_warehouse: Pick<Warehouse, 'id' | 'name' | 'city' | 'latitude' | 'longitude'>;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  scheduled_delivery: string;
  estimated_delivery: string;
  actual_delivery?: string;
  weather_condition: string;
  weather_delay_hours: number;
  tracking_events: TrackingEvent[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────

export interface NetworkStats {
  total_warehouses: number;
  total_cold_storages: number;
  total_hybrid: number;
  total_capacity_mt: number;
  total_used_capacity_mt: number;
  network_utilization_pct: number;
  states_covered: number;
  active_vendors: number;
}

export interface LowStockAlert {
  id: string;
  product: Pick<Product, 'id' | 'sku' | 'name' | 'category'>;
  warehouse: Pick<Warehouse, 'id' | 'name' | 'city' | 'warehouse_code'>;
  quantity_available: number;
  threshold: number;
  severity: 'LOW' | 'CRITICAL';
  created_at: string;
}

export interface StockMovement {
  id: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER';
  product: Pick<Product, 'id' | 'sku' | 'name'>;
  warehouse: Pick<Warehouse, 'id' | 'name' | 'city'>;
  quantity: number;
  performed_by: string;
  timestamp: string;
}

// ─── Search ───────────────────────────────────────────────────────────────

export interface SearchResult {
  product: Product;
  inventory: Array<{
    warehouse: Pick<Warehouse, 'id' | 'warehouse_code' | 'name' | 'city' | 'state' | 'facility_type'>;
    bin_location: string;
    quantity_available: number;
    lot_number: string;
    expiry_date: string | null;
  }>;
  total_available: number;
}
