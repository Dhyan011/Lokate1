/**
 * Typed API client + React Query hooks
 * USE_MOCK=true → returns mock data
 * USE_MOCK=false → calls the live FastAPI backend
 *
 * To switch any hook to live: set USE_MOCK = false in that hook,
 * or set VITE_USE_MOCK=false in .env
 */

import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import type {
  Warehouse,
  Product,
  InventoryRecord,
  Vendor,
  Delivery,
  NetworkStats,
  LowStockAlert,
  StockMovement,
  SearchResult,
  OrderRequest,
  OrderResponse,
} from '../types';
import {
  mockWarehouses,
  mockProducts,
  mockInventory,
  mockVendors,
  mockDeliveries,
  mockNetworkStats,
  mockAlerts,
  mockMovements,
  mockSearchResults,
  mockOrderResponse,
} from '../mocks/data';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// ─── Helpers ───────────────────────────────────────────────────────────────

function delay(ms = 600) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Network Stats ─────────────────────────────────────────────────────────

export function useNetworkStats() {
  return useQuery<NetworkStats>({
    queryKey: ['network-stats'],
    queryFn: async () => {
      if (USE_MOCK) { await delay(); return mockNetworkStats; }
      const { data } = await api.get('/dashboard/stats');
      return data;
    },
    staleTime: 60_000,
  });
}

// ─── Warehouses ────────────────────────────────────────────────────────────

export function useWarehouses(filters?: { state?: string; facility_type?: string; min_available?: number }) {
  return useQuery<Warehouse[]>({
    queryKey: ['warehouses', filters],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(400);
        let data = [...mockWarehouses];
        if (filters?.state) data = data.filter(w => w.state === filters.state);
        if (filters?.facility_type) data = data.filter(w => w.facility_type === filters.facility_type);
        if (filters?.min_available) data = data.filter(w => w.available_capacity_mt >= (filters.min_available ?? 0));
        return data;
      }
      const { data } = await api.get('/warehouses', { params: filters });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useWarehouse(id: string) {
  return useQuery<Warehouse>({
    queryKey: ['warehouse', id],
    queryFn: async () => {
      if (USE_MOCK) { await delay(300); return mockWarehouses.find(w => w.id === id) ?? mockWarehouses[0]; }
      const { data } = await api.get(`/warehouses/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ─── Products ──────────────────────────────────────────────────────────────

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (USE_MOCK) { await delay(); return mockProducts; }
      const { data } = await api.get('/products');
      return data;
    },
    staleTime: 120_000,
  });
}

// ─── Inventory ─────────────────────────────────────────────────────────────

export function useInventory(warehouseId?: string) {
  return useQuery<InventoryRecord[]>({
    queryKey: ['inventory', warehouseId],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay();
        return warehouseId ? mockInventory.filter(i => i.warehouse_id === warehouseId) : mockInventory;
      }
      const { data } = await api.get('/inventory', { params: warehouseId ? { warehouse_id: warehouseId } : {} });
      return data;
    },
  });
}

// ─── Vendors ───────────────────────────────────────────────────────────────

export function useVendors() {
  return useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: async () => {
      if (USE_MOCK) { await delay(); return mockVendors; }
      const { data } = await api.get('/vendors');
      return data;
    },
    staleTime: 300_000,
  });
}

// ─── Search ────────────────────────────────────────────────────────────────

export function useSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      if (USE_MOCK) {
        await delay(300);
        const q = query.toLowerCase();
        return mockSearchResults.filter(r =>
          r.product.name.toLowerCase().includes(q) ||
          r.product.sku.toLowerCase().includes(q) ||
          r.product.category.toLowerCase().includes(q)
        );
      }
      const { data } = await api.get('/search', { params: { q: query } });
      return data;
    },
    enabled: query.length > 1,
    staleTime: 10_000,
  });
}

// ─── Orders ────────────────────────────────────────────────────────────────

export function useCreateOrder() {
  return useMutation<OrderResponse, Error, OrderRequest>({
    mutationFn: async (req) => {
      if (USE_MOCK) { await delay(1200); return mockOrderResponse(req); }
      const { data } = await api.post('/orders', req);
      return data;
    },
  });
}

// ─── Deliveries ────────────────────────────────────────────────────────────

export function useDeliveries() {
  return useQuery<Delivery[]>({
    queryKey: ['deliveries'],
    queryFn: async () => {
      if (USE_MOCK) { await delay(); return mockDeliveries; }
      const { data } = await api.get('/deliveries');
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useDelivery(id: string) {
  return useQuery<Delivery>({
    queryKey: ['delivery', id],
    queryFn: async () => {
      if (USE_MOCK) { await delay(300); return mockDeliveries.find(d => d.id === id) ?? mockDeliveries[0]; }
      const { data } = await api.get(`/deliveries/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 15_000,
  });
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export function useLowStockAlerts() {
  return useQuery<LowStockAlert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      if (USE_MOCK) { await delay(); return mockAlerts; }
      const { data } = await api.get('/dashboard/low-stock');
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useStockMovements() {
  return useQuery<StockMovement[]>({
    queryKey: ['movements'],
    queryFn: async () => {
      if (USE_MOCK) { await delay(); return mockMovements; }
      const { data } = await api.get('/movements');
      return data;
    },
    refetchInterval: 30_000,
  });
}
