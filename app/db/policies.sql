-- Enable Row Level Security
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create user roles enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('public', 'intake_staff', 'field_volunteer', 'coordinator', 'admin');
    END IF;
END
$$;

-- Add role column to auth.users via custom table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'field_volunteer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS user_role AS $$
BEGIN
    RETURN COALESCE(
        (SELECT role FROM user_roles WHERE user_id = user_uuid),
        'public'::user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- REQUESTS POLICIES
-- Public can insert (for form submissions)
CREATE POLICY "Public can submit requests" ON requests
    FOR INSERT TO anon WITH CHECK (true);

-- Authenticated users can view requests based on role
CREATE POLICY "Staff can view all requests" ON requests
    FOR SELECT TO authenticated
    USING (get_user_role() IN ('intake_staff', 'coordinator', 'admin'));

-- Volunteers can only see assigned requests (limited PII)
CREATE POLICY "Volunteers can view assigned requests" ON requests
    FOR SELECT TO authenticated
    USING (
        get_user_role() = 'field_volunteer' 
        AND assignment ? 'volunteer_id'
        AND (assignment->>'volunteer_id')::UUID = auth.uid()
    );

-- Staff can update requests
CREATE POLICY "Staff can update requests" ON requests
    FOR UPDATE TO authenticated
    USING (get_user_role() IN ('intake_staff', 'coordinator', 'admin'))
    WITH CHECK (get_user_role() IN ('intake_staff', 'coordinator', 'admin'));

-- Volunteers can update status of assigned requests
CREATE POLICY "Volunteers can update assigned requests" ON requests
    FOR UPDATE TO authenticated
    USING (
        get_user_role() = 'field_volunteer'
        AND assignment ? 'volunteer_id'
        AND (assignment->>'volunteer_id')::UUID = auth.uid()
    )
    WITH CHECK (
        get_user_role() = 'field_volunteer'
        AND assignment ? 'volunteer_id'
        AND (assignment->>'volunteer_id')::UUID = auth.uid()
    );

-- VOLUNTEERS POLICIES
-- Volunteers can read their own profile
CREATE POLICY "Volunteers can view own profile" ON volunteers
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Staff can view all volunteers
CREATE POLICY "Staff can view all volunteers" ON volunteers
    FOR SELECT TO authenticated
    USING (get_user_role() IN ('intake_staff', 'coordinator', 'admin'));

-- Volunteers can update their own profile
CREATE POLICY "Volunteers can update own profile" ON volunteers
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff can manage all volunteers
CREATE POLICY "Staff can manage volunteers" ON volunteers
    FOR ALL TO authenticated
    USING (get_user_role() IN ('coordinator', 'admin'))
    WITH CHECK (get_user_role() IN ('coordinator', 'admin'));

-- RESOURCES POLICIES
-- Everyone can read public resources view (handled separately)
CREATE POLICY "Public can view resources" ON resources
    FOR SELECT TO anon, authenticated
    USING (true);

-- Only coordinators/admins can modify resources
CREATE POLICY "Coordinators can manage resources" ON resources
    FOR ALL TO authenticated
    USING (get_user_role() IN ('coordinator', 'admin'))
    WITH CHECK (get_user_role() IN ('coordinator', 'admin'));

-- ALERTS POLICIES
-- Only coordinators/admins can manage alerts
CREATE POLICY "Coordinators can manage alerts" ON alerts
    FOR ALL TO authenticated
    USING (get_user_role() IN ('coordinator', 'admin'))
    WITH CHECK (get_user_role() IN ('coordinator', 'admin'));

-- ATTACHMENTS POLICIES
-- Users can view attachments for records they can access
CREATE POLICY "Users can view relevant attachments" ON attachments
    FOR SELECT TO authenticated
    USING (
        -- Can view if they can view the parent record
        CASE table_ref
            WHEN 'requests' THEN EXISTS (
                SELECT 1 FROM requests r WHERE r.id = ref_id
                AND (
                    get_user_role() IN ('intake_staff', 'coordinator', 'admin')
                    OR (
                        get_user_role() = 'field_volunteer'
                        AND r.assignment ? 'volunteer_id'
                        AND (r.assignment->>'volunteer_id')::UUID = auth.uid()
                    )
                )
            )
            WHEN 'resources' THEN true  -- Resources are public
            WHEN 'volunteers' THEN EXISTS (
                SELECT 1 FROM volunteers v WHERE v.id = ref_id
                AND (v.user_id = auth.uid() OR get_user_role() IN ('coordinator', 'admin'))
            )
            ELSE false
        END
    );

-- Staff can upload attachments
CREATE POLICY "Staff can upload attachments" ON attachments
    FOR INSERT TO authenticated
    WITH CHECK (get_user_role() IN ('intake_staff', 'field_volunteer', 'coordinator', 'admin'));

-- AUDIT LOG POLICIES
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_log
    FOR SELECT TO authenticated
    USING (get_user_role() = 'admin');

-- Grant permissions on public_resources_view
GRANT SELECT ON public_resources_view TO anon, authenticated;

-- Grant usage on custom types
GRANT USAGE ON TYPE need_type TO anon, authenticated;
GRANT USAGE ON TYPE priority_level TO anon, authenticated;
GRANT USAGE ON TYPE request_status TO anon, authenticated;
GRANT USAGE ON TYPE resource_type TO anon, authenticated;
GRANT USAGE ON TYPE resource_status TO anon, authenticated;
GRANT USAGE ON TYPE alert_type TO anon, authenticated;
GRANT USAGE ON TYPE audience_type TO anon, authenticated;
GRANT USAGE ON TYPE dispatch_channel TO anon, authenticated;
GRANT USAGE ON TYPE request_source TO anon, authenticated;
GRANT USAGE ON TYPE availability_type TO anon, authenticated;
GRANT USAGE ON TYPE user_role TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION find_recipients_in_radius TO authenticated;