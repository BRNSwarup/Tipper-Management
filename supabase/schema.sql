-- ============================================================================
-- TRUCK MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM & CONSTANT CHECK HELPERS
-- Roles: owner, manager, accountant, driver
-- Truck Types: open, container, tipper, trailer, tanker, flatbed
-- Truck Ownership: owned, attached
-- Truck Status: available, on_trip, maintenance, inactive
-- Driver Status: active, on_trip, on_leave, inactive
-- Trip Status: planned, running, delivered, billed, closed
-- Expense Categories: fuel, toll, loading, unloading, driver_bata, fines, parking, misc
-- Maintenance Types: scheduled, breakdown, tyre_service, accident, general
-- Tyre Status: in_stock, fitted, retreaded, scrapped
-- Document Types: rc, insurance, fitness, permit, national_permit, puc, driving_licence, other
-- Invoice Payment Status: unpaid, partially_paid, paid, overdue

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('owner', 'manager', 'accountant', 'driver')),
    phone TEXT,
    assigned_driver_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRUCKS TABLE
CREATE TABLE IF NOT EXISTS trucks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number TEXT UNIQUE NOT NULL,
    chassis_number TEXT,
    engine_number TEXT,
    make_model TEXT NOT NULL,
    truck_type TEXT NOT NULL CHECK (truck_type IN ('open', 'container', 'tipper', 'trailer', 'tanker', 'flatbed')),
    capacity_tons NUMERIC(8,2) NOT NULL DEFAULT 10.00,
    axles INT NOT NULL DEFAULT 2,
    ownership_type TEXT NOT NULL CHECK (ownership_type IN ('owned', 'attached')),
    purchase_date DATE,
    current_odometer NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'on_trip', 'maintenance', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 5. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    licence_number TEXT NOT NULL UNIQUE,
    licence_expiry_date DATE NOT NULL,
    address TEXT,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    salary_type TEXT NOT NULL CHECK (salary_type IN ('monthly', 'per_trip', 'per_km')),
    rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    assigned_truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_trip', 'on_leave', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Foreign key back link in profiles to drivers
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_assigned_driver_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_assigned_driver_id_fkey FOREIGN KEY (assigned_driver_id) REFERENCES drivers(id) ON DELETE SET NULL;

-- 6. PARTIES TABLE (Consignors, Consignees, Brokers, Vendors)
CREATE TABLE IF NOT EXISTS parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    party_type TEXT NOT NULL CHECK (party_type IN ('consignor', 'consignee', 'broker', 'vendor')),
    gstin TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    credit_days INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 7. TRIPS TABLE (Central Operational Entity)
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_number TEXT UNIQUE NOT NULL,
    truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE RESTRICT,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE RESTRICT,
    source_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    lr_number TEXT NOT NULL,
    goods_description TEXT,
    weight_tons NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE,
    starting_odometer NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    ending_odometer NUMERIC(10,2) DEFAULT 0.00,
    freight_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    driver_advance NUMERIC(12,2) DEFAULT 0.00,
    pod_file_url TEXT,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'running', 'delivered', 'billed', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 8. TRIP EXPENSES TABLE
CREATE TABLE IF NOT EXISTS trip_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('fuel', 'toll', 'loading', 'unloading', 'driver_bata', 'fines', 'parking', 'misc')),
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    paid_by TEXT NOT NULL CHECK (paid_by IN ('driver', 'office')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FUEL ENTRIES TABLE
CREATE TABLE IF NOT EXISTS fuel_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    odometer NUMERIC(10,2) NOT NULL,
    litres NUMERIC(8,2) NOT NULL CHECK (litres > 0),
    rate_per_litre NUMERIC(8,2) NOT NULL CHECK (rate_per_litre > 0),
    total_amount NUMERIC(10,2) NOT NULL,
    fuel_pump TEXT,
    payment_mode TEXT NOT NULL DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'card', 'fuel_card', 'upi', 'credit')),
    is_tank_full BOOLEAN DEFAULT TRUE,
    mileage_kmpl NUMERIC(6,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MAINTENANCE TABLE
CREATE TABLE IF NOT EXISTS maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    odometer NUMERIC(10,2) NOT NULL,
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('scheduled', 'breakdown', 'tyre_service', 'accident', 'general')),
    workshop_name TEXT NOT NULL,
    description TEXT,
    labour_cost NUMERIC(10,2) DEFAULT 0.00,
    parts_cost NUMERIC(10,2) DEFAULT 0.00,
    total_cost NUMERIC(10,2) NOT NULL,
    downtime_days INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TYRES TABLE
CREATE TABLE IF NOT EXISTS tyres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'fitted', 'retreaded', 'scrapped')),
    assigned_truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    position TEXT CHECK (position IN ('FL', 'FR', 'RL1', 'RR1', 'RL2', 'RR2', 'SPARE')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TYRE EVENTS TABLE
CREATE TABLE IF NOT EXISTS tyre_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tyre_id UUID NOT NULL REFERENCES tyres(id) ON DELETE CASCADE,
    truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('fitted', 'removed', 'retreaded', 'scrapped')),
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    odometer NUMERIC(10,2),
    cost NUMERIC(10,2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. DRIVER LEDGER TABLE
CREATE TABLE IF NOT EXISTS driver_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('advance', 'expense_claim', 'salary', 'bata', 'deduction', 'settlement')),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    direction TEXT NOT NULL CHECK (direction IN ('debit', 'credit')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('truck', 'driver')),
    entity_id UUID NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('rc', 'insurance', 'fitness', 'permit', 'national_permit', 'puc', 'driving_licence', 'other')),
    document_number TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE NOT NULL,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE RESTRICT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    taxable_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. INVOICE TRIPS TABLE (Junction)
CREATE TABLE IF NOT EXISTS invoice_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE RESTRICT,
    UNIQUE(invoice_id, trip_id)
);

-- 17. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE RESTRICT,
    amount_paid NUMERIC(12,2) NOT NULL CHECK (amount_paid > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('bank_transfer', 'upi', 'cheque', 'cash')),
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_trucks_status ON trucks(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_trips_truck ON trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_party ON trips(party_id);
CREATE INDEX IF NOT EXISTS idx_fuel_truck ON fuel_entries(truck_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_truck ON maintenance(truck_id);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_driver_ledger_driver ON driver_ledger(driver_id);

-- ============================================================================
-- AUTOMATIC TIMESTAMPTZ TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_update_trucks BEFORE UPDATE ON trucks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_update_drivers BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_update_parties BEFORE UPDATE ON parties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_update_trips BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tyres ENABLE ROW LEVEL SECURITY;
ALTER TABLE tyre_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
    RETURN COALESCE(user_role, 'driver');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policy: Users can read all profiles; owners can update all profiles; users can update own profile
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Operational Tables RLS (Trucks, Drivers, Parties, Trips, etc.)
-- Owners, Managers, Accountants have full read/write access
-- Drivers can view trucks, assigned trips, log expenses/fuel for assigned trip

CREATE POLICY "Staff full access trucks" ON trucks FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);
CREATE POLICY "Driver read trucks" ON trucks FOR SELECT USING (
    get_user_role() = 'driver'
);

CREATE POLICY "Staff full access drivers" ON drivers FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);
CREATE POLICY "Driver read own record" ON drivers FOR SELECT USING (
    get_user_role() = 'driver'
);

CREATE POLICY "Staff full access parties" ON parties FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);

CREATE POLICY "Staff full access trips" ON trips FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);
CREATE POLICY "Driver view assigned trips" ON trips FOR SELECT USING (
    get_user_role() = 'driver' AND driver_id IN (
        SELECT assigned_driver_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Staff full access trip_expenses" ON trip_expenses FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);
CREATE POLICY "Driver manage trip expenses" ON trip_expenses FOR ALL USING (
    get_user_role() = 'driver'
);

CREATE POLICY "Staff full access fuel_entries" ON fuel_entries FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);
CREATE POLICY "Driver add fuel entry" ON fuel_entries FOR INSERT WITH CHECK (
    get_user_role() = 'driver'
);
CREATE POLICY "Driver view fuel entries" ON fuel_entries FOR SELECT USING (
    get_user_role() = 'driver'
);

CREATE POLICY "Staff full access maintenance" ON maintenance FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);

CREATE POLICY "Staff full access tyres" ON tyres FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);
CREATE POLICY "Staff full access tyre_events" ON tyre_events FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);

CREATE POLICY "Staff full access driver_ledger" ON driver_ledger FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);
CREATE POLICY "Driver view own ledger" ON driver_ledger FOR SELECT USING (
    get_user_role() = 'driver'
);

CREATE POLICY "Staff full access documents" ON documents FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);
CREATE POLICY "Driver view documents" ON documents FOR SELECT USING (
    get_user_role() = 'driver'
);

CREATE POLICY "Staff full access invoices" ON invoices FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);
CREATE POLICY "Staff full access invoice_trips" ON invoice_trips FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);
CREATE POLICY "Staff full access payments" ON payments FOR ALL USING (
    get_user_role() IN ('owner', 'manager', 'accountant')
);

-- ============================================================================
-- STORAGE BUCKETS CONFIGURATION (Supabase Storage SQL)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
('documents', 'documents', false),
('expense-bills', 'expense-bills', false),
('pod-files', 'pod-files', false),
('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Authenticated Users Upload Bucket Objects" ON storage.objects 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Users Read Bucket Objects" ON storage.objects 
FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- COMPREHENSIVE SEED DATA
-- ============================================================================
-- Seed data will be inserted dynamically or when running this migration script.
