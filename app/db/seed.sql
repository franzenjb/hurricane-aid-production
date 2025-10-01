-- Insert sample resources for Miami area
INSERT INTO resources (name, resource_type, status, hours, capacity, contact_phone, geom, details) VALUES
('Miami Beach Emergency Shelter', 'shelter', 'open', '24/7', 200, '(305) 555-0100', 
 ST_SetSRID(ST_MakePoint(-80.1300, 25.7907), 4326)::geography,
 '{"pet_friendly": true, "wheelchair_accessible": true, "registration_required": false}'::jsonb),

('Little Haiti Food Kitchen', 'kitchen', 'open', '8:00 AM - 6:00 PM', 500, '(305) 555-0101',
 ST_SetSRID(ST_MakePoint(-80.1951, 25.8295), 4326)::geography,
 '{"dietary_restrictions": ["vegetarian", "gluten_free"], "takeout_available": true}'::jsonb),

('Homestead Equipment Center', 'equipment', 'open', '6:00 AM - 8:00 PM', NULL, '(305) 555-0102',
 ST_SetSRID(ST_MakePoint(-80.4773, 25.4687), 4326)::geography,
 '{"available_equipment": ["generators", "chainsaws", "pumps", "tarps"], "id_required": true}'::jsonb),

('Coral Gables Water Distribution', 'water', 'open', '7:00 AM - 7:00 PM', NULL, '(305) 555-0103',
 ST_SetSRID(ST_MakePoint(-80.2711, 25.7617), 4326)::geography,
 '{"bottled_water": true, "limit_per_family": "2 cases", "drive_through": true}'::jsonb),

('Downtown Miami Charging Station', 'charging', 'open', '24/7', 50, '(305) 555-0104',
 ST_SetSRID(ST_MakePoint(-80.1918, 25.7617), 4326)::geography,
 '{"device_types": ["phones", "tablets", "laptops"], "cables_provided": true}'::jsonb),

('Miami Lakes Community WiFi', 'wifi', 'open', '8:00 AM - 10:00 PM', NULL, NULL,
 ST_SetSRID(ST_MakePoint(-80.3087, 25.9087), 4326)::geography,
 '{"network_name": "MiamiLakes_Emergency", "password": "Relief2024", "bandwidth": "high"}'::jsonb),

('Hialeah Emergency Food Pantry', 'food', 'open', '9:00 AM - 5:00 PM', NULL, '(305) 555-0105',
 ST_SetSRID(ST_MakePoint(-80.2781, 25.8576), 4326)::geography,
 '{"non_perishables": true, "fresh_produce": true, "baby_formula": true}'::jsonb),

('Kendall High School Shelter', 'shelter', 'full', '24/7', 150, '(305) 555-0106',
 ST_SetSRID(ST_MakePoint(-80.4139, 25.6798), 4326)::geography,
 '{"pet_friendly": false, "wheelchair_accessible": true, "registration_required": true}'::jsonb);

-- Insert sample help requests
INSERT INTO requests (resident_name, phone, email, address, need_type, priority, status, geom, notes, source) VALUES
('Maria Gonzalez', '(305) 555-1001', 'maria.gonzalez@email.com', '123 SW 8th St, Miami, FL 33130', 'food', 'high', 'new',
 ST_SetSRID(ST_MakePoint(-80.2089, 25.7663), 4326)::geography,
 'Elderly resident, limited mobility, needs food delivery. Lives alone.', 'phone'),

('John Smith', '(305) 555-1002', 'john.smith@email.com', '456 Ocean Dr, Miami Beach, FL 33139', 'debris', 'medium', 'assigned',
 ST_SetSRID(ST_MakePoint(-80.1300, 25.7815), 4326)::geography,
 'Large tree fell on driveway, blocking car access. Need chainsaw help.', 'self'),

('Carmen Rodriguez', '(305) 555-1003', NULL, '789 NW 7th Ave, Miami, FL 33136', 'water', 'urgent', 'new',
 ST_SetSRID(ST_MakePoint(-80.2056, 25.7845), 4326)::geography,
 'Family of 5, no running water for 3 days. Young children need clean water.', 'phone'),

('Robert Johnson', '(305) 555-1004', 'rjohnson@email.com', '321 Coral Way, Coral Gables, FL 33134', 'muck_out', 'medium', 'triage',
 ST_SetSRID(ST_MakePoint(-80.2711, 25.7470), 4326)::geography,
 'First floor flooded, need help removing damaged furniture and cleaning.', 'self'),

('Ana Herrera', '(305) 555-1005', 'ana.h@email.com', '654 W Flagler St, Miami, FL 33130', 'medical', 'urgent', 'assigned',
 ST_SetSRID(ST_MakePoint(-80.2034, 25.7737), 4326)::geography,
 'Diabetic patient, medication ran out, needs transport to pharmacy.', 'phone');

-- Insert sample volunteers
INSERT INTO volunteers (full_name, phone, email, skills, availability, home_base, opt_in_alerts, geom) VALUES
('Mike Thompson', '(305) 555-2001', 'mike.thompson@email.com', ARRAY['chainsaw', 'debris_removal', 'construction'], 'now', 'Coconut Grove',
 true, ST_SetSRID(ST_MakePoint(-80.2436, 25.7282), 4326)::geography),

('Sarah Davis', '(305) 555-2002', 'sarah.davis@email.com', ARRAY['spanish', 'elderly_care', 'medical_transport'], 'today', 'Coral Gables',
 true, ST_SetSRID(ST_MakePoint(-80.2711, 25.7617), 4326)::geography),

('Carlos Mendez', '(305) 555-2003', 'carlos.mendez@email.com', ARRAY['muck_out', 'heavy_lifting', 'spanish'], 'week', 'Hialeah',
 true, ST_SetSRID(ST_MakePoint(-80.2781, 25.8576), 4326)::geography),

('Lisa Williams', '(305) 555-2004', 'lisa.williams@email.com', ARRAY['food_prep', 'organization', 'childcare'], 'weekends', 'Miami Beach',
 true, ST_SetSRID(ST_MakePoint(-80.1300, 25.7907), 4326)::geography),

('David Park', '(305) 555-2005', 'david.park@email.com', ARRAY['technology', 'communications', 'data_entry'], 'now', 'Downtown Miami',
 false, ST_SetSRID(ST_MakePoint(-80.1918, 25.7617), 4326)::geography);

-- Update some requests with volunteer assignments
UPDATE requests 
SET assignment = jsonb_build_object(
    'volunteer_id', (SELECT id FROM volunteers WHERE full_name = 'Mike Thompson'),
    'scheduled_at', NOW() + INTERVAL '2 hours',
    'eta', '2-3 hours'
)
WHERE resident_name = 'John Smith';

UPDATE requests 
SET assignment = jsonb_build_object(
    'volunteer_id', (SELECT id FROM volunteers WHERE full_name = 'Sarah Davis'),
    'scheduled_at', NOW() + INTERVAL '1 hour',
    'eta', '1-2 hours'
)
WHERE resident_name = 'Ana Herrera';

-- Insert sample alert
INSERT INTO alerts (alert_type, title, message, radius_km, origin, audience, dispatch_channel, dispatched_at) VALUES
('resource_opened', 'New Food Distribution Site Open', 
 'A new food distribution site is now open at Little Haiti Community Center. Free meals and groceries available from 8 AM to 6 PM today.', 
 5.0, ST_SetSRID(ST_MakePoint(-80.1951, 25.8295), 4326)::geography, 'both', 'email', NOW() - INTERVAL '30 minutes');

-- Create a sample admin user role (you'll need to replace with actual user ID after auth setup)
-- INSERT INTO user_roles (user_id, role) VALUES 
-- ('your-admin-user-id-here', 'admin');

-- Add some sample attachments
INSERT INTO attachments (table_ref, ref_id, url, caption, content_type, size_bytes) VALUES
('requests', (SELECT id FROM requests WHERE resident_name = 'John Smith'), 
 'https://example.com/tree-damage-photo.jpg', 'Tree blocking driveway', 'image/jpeg', 245760),
('resources', (SELECT id FROM resources WHERE name = 'Miami Beach Emergency Shelter'),
 'https://example.com/shelter-interior.jpg', 'Interior view of shelter space', 'image/jpeg', 189440);