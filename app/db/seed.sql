-- Insert sample resources for Pinellas County, Florida
INSERT INTO resources (name, resource_type, status, hours, capacity, contact_phone, geom, details) VALUES
('St. Petersburg Emergency Shelter', 'shelter', 'open', '24/7', 300, '(727) 555-0100', 
 ST_SetSRID(ST_MakePoint(-82.6404, 27.7676), 4326)::geography,
 '{"pet_friendly": true, "wheelchair_accessible": true, "registration_required": false}'::jsonb),

('Clearwater Community Kitchen', 'kitchen', 'open', '8:00 AM - 6:00 PM', 400, '(727) 555-0101',
 ST_SetSRID(ST_MakePoint(-82.8001, 27.9659), 4326)::geography,
 '{"dietary_restrictions": ["vegetarian", "gluten_free"], "takeout_available": true}'::jsonb),

('Pinellas Park Equipment Center', 'equipment', 'open', '6:00 AM - 8:00 PM', NULL, '(727) 555-0102',
 ST_SetSRID(ST_MakePoint(-82.6995, 27.8428), 4326)::geography,
 '{"available_equipment": ["generators", "chainsaws", "pumps", "tarps"], "id_required": true}'::jsonb),

('Largo Water Distribution', 'water', 'open', '7:00 AM - 7:00 PM', NULL, '(727) 555-0103',
 ST_SetSRID(ST_MakePoint(-82.7873, 27.9095), 4326)::geography,
 '{"bottled_water": true, "limit_per_family": "2 cases", "drive_through": true}'::jsonb),

('Treasure Island Charging Station', 'charging', 'open', '24/7', 50, '(727) 555-0104',
 ST_SetSRID(ST_MakePoint(-82.7693, 27.7664), 4326)::geography,
 '{"device_types": ["phones", "tablets", "laptops"], "cables_provided": true}'::jsonb),

('Dunedin Community WiFi', 'wifi', 'open', '8:00 AM - 10:00 PM', NULL, NULL,
 ST_SetSRID(ST_MakePoint(-82.7717, 28.0197), 4326)::geography,
 '{"network_name": "Dunedin_Emergency", "password": "Relief2024", "bandwidth": "high"}'::jsonb),

('Safety Harbor Food Pantry', 'food', 'open', '9:00 AM - 5:00 PM', NULL, '(727) 555-0105',
 ST_SetSRID(ST_MakePoint(-82.6940, 28.0042), 4326)::geography,
 '{"non_perishables": true, "fresh_produce": true, "baby_formula": true}'::jsonb),

('Seminole High School Shelter', 'shelter', 'full', '24/7', 200, '(727) 555-0106',
 ST_SetSRID(ST_MakePoint(-82.7937, 27.8387), 4326)::geography,
 '{"pet_friendly": false, "wheelchair_accessible": true, "registration_required": true}'::jsonb);

-- Insert sample help requests for Pinellas County
INSERT INTO requests (resident_name, phone, email, address, need_type, priority, status, geom, notes, source) VALUES
('Maria Rodriguez', '(727) 555-1001', 'maria.rodriguez@email.com', '1234 4th St N, St. Petersburg, FL 33704', 'food', 'high', 'new',
 ST_SetSRID(ST_MakePoint(-82.6404, 27.7676), 4326)::geography,
 'Elderly resident, limited mobility, needs food delivery. Lives alone.', 'phone'),

('John Thompson', '(727) 555-1002', 'john.thompson@email.com', '567 Gulf Blvd, Treasure Island, FL 33706', 'debris', 'medium', 'assigned',
 ST_SetSRID(ST_MakePoint(-82.7693, 27.7664), 4326)::geography,
 'Large tree fell on driveway, blocking car access. Need chainsaw help.', 'self'),

('Carmen Wilson', '(727) 555-1003', NULL, '890 Cleveland St, Clearwater, FL 33755', 'water', 'urgent', 'new',
 ST_SetSRID(ST_MakePoint(-82.8001, 27.9659), 4326)::geography,
 'Family of 5, no running water for 3 days. Young children need clean water.', 'phone'),

('Robert Davis', '(727) 555-1004', 'rdavis@email.com', '456 Ulmerton Rd, Largo, FL 33771', 'muck_out', 'medium', 'triage',
 ST_SetSRID(ST_MakePoint(-82.7873, 27.9095), 4326)::geography,
 'First floor flooded, need help removing damaged furniture and cleaning.', 'self'),

('Ana Martinez', '(727) 555-1005', 'ana.martinez@email.com', '123 Main St, Safety Harbor, FL 34695', 'medical', 'urgent', 'assigned',
 ST_SetSRID(ST_MakePoint(-82.6940, 28.0042), 4326)::geography,
 'Diabetic patient, medication ran out, needs transport to pharmacy.', 'phone');

-- Insert sample volunteers for Pinellas County
INSERT INTO volunteers (full_name, phone, email, skills, availability, home_base, opt_in_alerts, geom) VALUES
('Mike Johnson', '(727) 555-2001', 'mike.johnson@email.com', ARRAY['chainsaw', 'debris_removal', 'construction'], 'now', 'St. Petersburg',
 true, ST_SetSRID(ST_MakePoint(-82.6404, 27.7676), 4326)::geography),

('Sarah Brown', '(727) 555-2002', 'sarah.brown@email.com', ARRAY['spanish', 'elderly_care', 'medical_transport'], 'today', 'Clearwater',
 true, ST_SetSRID(ST_MakePoint(-82.8001, 27.9659), 4326)::geography),

('Carlos Garcia', '(727) 555-2003', 'carlos.garcia@email.com', ARRAY['muck_out', 'heavy_lifting', 'spanish'], 'week', 'Largo',
 true, ST_SetSRID(ST_MakePoint(-82.7873, 27.9095), 4326)::geography),

('Lisa Anderson', '(727) 555-2004', 'lisa.anderson@email.com', ARRAY['food_prep', 'organization', 'childcare'], 'weekends', 'Dunedin',
 true, ST_SetSRID(ST_MakePoint(-82.7717, 28.0197), 4326)::geography),

('David Wilson', '(727) 555-2005', 'david.wilson@email.com', ARRAY['technology', 'communications', 'data_entry'], 'now', 'Pinellas Park',
 false, ST_SetSRID(ST_MakePoint(-82.6995, 27.8428), 4326)::geography);

-- Update some requests with volunteer assignments
UPDATE requests 
SET assignment = jsonb_build_object(
    'volunteer_id', (SELECT id FROM volunteers WHERE full_name = 'Mike Johnson'),
    'scheduled_at', NOW() + INTERVAL '2 hours',
    'eta', '2-3 hours'
)
WHERE resident_name = 'John Thompson';

UPDATE requests 
SET assignment = jsonb_build_object(
    'volunteer_id', (SELECT id FROM volunteers WHERE full_name = 'Sarah Brown'),
    'scheduled_at', NOW() + INTERVAL '1 hour',
    'eta', '1-2 hours'
)
WHERE resident_name = 'Ana Martinez';

-- Insert sample alert for Pinellas County
INSERT INTO alerts (alert_type, title, message, radius_km, origin, audience, dispatch_channel, dispatched_at) VALUES
('resource_opened', 'New Food Distribution Site Open', 
 'A new food distribution site is now open at Clearwater Community Kitchen. Free meals and groceries available from 8 AM to 6 PM today.', 
 5.0, ST_SetSRID(ST_MakePoint(-82.8001, 27.9659), 4326)::geography, 'both', 'email', NOW() - INTERVAL '30 minutes');

-- Create a sample admin user role (you'll need to replace with actual user ID after auth setup)
-- INSERT INTO user_roles (user_id, role) VALUES 
-- ('your-admin-user-id-here', 'admin');

-- Add some sample attachments
INSERT INTO attachments (table_ref, ref_id, url, caption, content_type, size_bytes) VALUES
('requests', (SELECT id FROM requests WHERE resident_name = 'John Thompson'), 
 'https://example.com/tree-damage-photo.jpg', 'Tree blocking driveway', 'image/jpeg', 245760),
('resources', (SELECT id FROM resources WHERE name = 'St. Petersburg Emergency Shelter'),
 'https://example.com/shelter-interior.jpg', 'Interior view of shelter space', 'image/jpeg', 189440);