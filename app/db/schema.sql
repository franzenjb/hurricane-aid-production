-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create custom types
CREATE TYPE need_type AS ENUM ('food', 'water', 'muck_out', 'debris', 'medical', 'welfare_check', 'other');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE request_status AS ENUM ('new', 'triage', 'assigned', 'in_progress', 'complete', 'duplicate', 'unable_to_contact');
CREATE TYPE resource_type AS ENUM ('shelter', 'kitchen', 'equipment', 'water', 'food', 'charging', 'wifi', 'other');
CREATE TYPE resource_status AS ENUM ('open', 'full', 'closed', 'stand_by');
CREATE TYPE alert_type AS ENUM ('resource_opened', 'resource_closed', 'safety', 'update');
CREATE TYPE audience_type AS ENUM ('residents', 'volunteers', 'both');
CREATE TYPE dispatch_channel AS ENUM ('email', 'sms', 'both');
CREATE TYPE request_source AS ENUM ('self', 'phone', 'email', 'import');
CREATE TYPE availability_type AS ENUM ('now', 'today', 'week', 'weekends');

-- Requests table
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    resident_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    notes TEXT,
    need_type need_type NOT NULL DEFAULT 'other',
    priority priority_level NOT NULL DEFAULT 'medium',
    status request_status NOT NULL DEFAULT 'new',
    geom GEOGRAPHY(Point, 4326),
    photos JSONB DEFAULT '[]'::jsonb,
    source request_source NOT NULL DEFAULT 'self',
    assignment JSONB
);

-- Volunteers table
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    availability availability_type DEFAULT 'weekends',
    home_base TEXT,
    opt_in_alerts BOOLEAN DEFAULT true,
    geom GEOGRAPHY(Point, 4326)
);

-- Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    resource_type resource_type NOT NULL,
    name TEXT NOT NULL,
    hours TEXT,
    capacity INTEGER,
    status resource_status NOT NULL DEFAULT 'open',
    contact_phone TEXT,
    geom GEOGRAPHY(Point, 4326) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb
);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    alert_type alert_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    radius_km NUMERIC NOT NULL DEFAULT 3,
    origin GEOGRAPHY(Point, 4326) NOT NULL,
    audience audience_type NOT NULL DEFAULT 'both',
    dispatch_channel dispatch_channel NOT NULL DEFAULT 'email',
    dispatched_at TIMESTAMP WITH TIME ZONE
);

-- Attachments table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    table_ref TEXT NOT NULL,
    ref_id UUID NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    content_type TEXT,
    size_bytes INTEGER
);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    actor UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_ref TEXT NOT NULL,
    ref_id UUID NOT NULL,
    diff JSONB
);

-- Create spatial indexes
CREATE INDEX idx_requests_geom ON requests USING GIST (geom);
CREATE INDEX idx_volunteers_geom ON volunteers USING GIST (geom);
CREATE INDEX idx_resources_geom ON resources USING GIST (geom);
CREATE INDEX idx_alerts_origin ON alerts USING GIST (origin);

-- Create btree indexes
CREATE INDEX idx_requests_status ON requests (status);
CREATE INDEX idx_requests_need_type ON requests (need_type);
CREATE INDEX idx_requests_priority ON requests (priority);
CREATE INDEX idx_requests_created_at ON requests (created_at);
CREATE INDEX idx_resources_type ON resources (resource_type);
CREATE INDEX idx_resources_status ON resources (status);
CREATE INDEX idx_volunteers_user_id ON volunteers (user_id);
CREATE INDEX idx_attachments_ref ON attachments (table_ref, ref_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log changes
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (actor, action, table_ref, ref_id, diff)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (actor, action, table_ref, ref_id, diff)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (actor, action, table_ref, ref_id, diff)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Add audit triggers
CREATE TRIGGER audit_requests AFTER INSERT OR UPDATE OR DELETE ON requests FOR EACH ROW EXECUTE FUNCTION log_changes();
CREATE TRIGGER audit_volunteers AFTER INSERT OR UPDATE OR DELETE ON volunteers FOR EACH ROW EXECUTE FUNCTION log_changes();
CREATE TRIGGER audit_resources AFTER INSERT OR UPDATE OR DELETE ON resources FOR EACH ROW EXECUTE FUNCTION log_changes();

-- Create view for public resources (no PII)
CREATE VIEW public_resources_view AS
SELECT 
    id,
    resource_type,
    name,
    hours,
    capacity,
    status,
    geom,
    details,
    created_at,
    updated_at
FROM resources
WHERE status IN ('open', 'full');

-- Function to find recipients within radius
CREATE OR REPLACE FUNCTION find_recipients_in_radius(
    origin_point GEOGRAPHY,
    radius_meters NUMERIC,
    target_audience audience_type DEFAULT 'both'
)
RETURNS TABLE (
    email TEXT,
    recipient_type TEXT,
    distance_m NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH recipients AS (
        -- Get volunteers
        SELECT 
            v.email,
            'volunteer' as recipient_type,
            ST_Distance(v.geom, origin_point) as distance_m
        FROM volunteers v
        WHERE v.opt_in_alerts = true
            AND v.geom IS NOT NULL
            AND ST_DWithin(v.geom, origin_point, radius_meters)
            AND (target_audience IN ('volunteers', 'both'))
        
        UNION ALL
        
        -- Get requesters (residents)
        SELECT 
            r.email,
            'resident' as recipient_type,
            ST_Distance(r.geom, origin_point) as distance_m
        FROM requests r
        WHERE r.email IS NOT NULL
            AND r.geom IS NOT NULL
            AND r.status NOT IN ('complete', 'duplicate')
            AND ST_DWithin(r.geom, origin_point, radius_meters)
            AND (target_audience IN ('residents', 'both'))
    )
    SELECT 
        r.email,
        r.recipient_type,
        r.distance_m
    FROM recipients r
    ORDER BY r.distance_m;
END;
$$ LANGUAGE plpgsql;