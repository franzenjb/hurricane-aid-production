// Mock data for demonstration purposes
// This simulates what would come from Supabase in production

export const mockRequests = [
  {
    id: '1',
    resident_name: 'Maria Rodriguez',
    phone: '(727) 555-1001',
    email: 'maria.rodriguez@email.com',
    address: '1234 4th St N, St. Petersburg, FL 33704',
    need_type: 'food',
    priority: 'high',
    status: 'new',
    notes: 'Elderly resident, limited mobility, needs food delivery. Lives alone.',
    source: 'phone',
    created_at: '2024-10-01T10:30:00Z',
    assignment: null
  },
  {
    id: '2',
    resident_name: 'John Thompson',
    phone: '(727) 555-1002',
    email: 'john.thompson@email.com',
    address: '567 Gulf Blvd, Treasure Island, FL 33706',
    need_type: 'debris',
    priority: 'medium',
    status: 'assigned',
    notes: 'Large tree fell on driveway, blocking car access. Need chainsaw help.',
    source: 'self',
    created_at: '2024-10-01T09:15:00Z',
    assignment: {
      volunteer_id: '1',
      volunteer_name: 'Mike Johnson',
      scheduled_at: '2024-10-01T14:00:00Z',
      eta: '2-3 hours'
    }
  },
  {
    id: '3',
    resident_name: 'Carmen Wilson',
    phone: '(727) 555-1003',
    email: null,
    address: '890 Cleveland St, Clearwater, FL 33755',
    need_type: 'water',
    priority: 'urgent',
    status: 'new',
    notes: 'Family of 5, no running water for 3 days. Young children need clean water.',
    source: 'phone',
    created_at: '2024-10-01T08:45:00Z',
    assignment: null
  },
  {
    id: '4',
    resident_name: 'Robert Davis',
    phone: '(727) 555-1004',
    email: 'rdavis@email.com',
    address: '456 Ulmerton Rd, Largo, FL 33771',
    need_type: 'muck_out',
    priority: 'medium',
    status: 'in_progress',
    notes: 'First floor flooded, need help removing damaged furniture and cleaning.',
    source: 'self',
    created_at: '2024-09-30T16:20:00Z',
    assignment: {
      volunteer_id: '3',
      volunteer_name: 'Carlos Garcia',
      scheduled_at: '2024-10-01T13:00:00Z',
      eta: '1-2 hours'
    }
  },
  {
    id: '5',
    resident_name: 'Ana Martinez',
    phone: '(727) 555-1005',
    email: 'ana.martinez@email.com',
    address: '123 Main St, Safety Harbor, FL 34695',
    need_type: 'medical',
    priority: 'urgent',
    status: 'complete',
    notes: 'Diabetic patient, medication ran out, needed transport to pharmacy.',
    source: 'phone',
    created_at: '2024-09-30T14:10:00Z',
    assignment: {
      volunteer_id: '2',
      volunteer_name: 'Sarah Brown',
      scheduled_at: '2024-09-30T15:00:00Z',
      eta: 'Completed'
    }
  }
]

export const mockVolunteers = [
  {
    id: '1',
    full_name: 'Mike Johnson',
    phone: '(727) 555-2001',
    email: 'mike.johnson@email.com',
    skills: ['chainsaw', 'debris_removal', 'construction'],
    availability: 'now',
    home_base: 'St. Petersburg',
    opt_in_alerts: true,
    active_requests: 1,
    total_completed: 12
  },
  {
    id: '2',
    full_name: 'Sarah Brown',
    phone: '(727) 555-2002',
    email: 'sarah.brown@email.com',
    skills: ['spanish', 'elderly_care', 'medical_transport'],
    availability: 'today',
    home_base: 'Clearwater',
    opt_in_alerts: true,
    active_requests: 0,
    total_completed: 8
  },
  {
    id: '3',
    full_name: 'Carlos Garcia',
    phone: '(727) 555-2003',
    email: 'carlos.garcia@email.com',
    skills: ['muck_out', 'heavy_lifting', 'spanish'],
    availability: 'week',
    home_base: 'Largo',
    opt_in_alerts: true,
    active_requests: 1,
    total_completed: 15
  },
  {
    id: '4',
    full_name: 'Lisa Anderson',
    phone: '(727) 555-2004',
    email: 'lisa.anderson@email.com',
    skills: ['food_prep', 'organization', 'childcare'],
    availability: 'weekends',
    home_base: 'Dunedin',
    opt_in_alerts: true,
    active_requests: 0,
    total_completed: 6
  },
  {
    id: '5',
    full_name: 'David Wilson',
    phone: '(727) 555-2005',
    email: 'david.wilson@email.com',
    skills: ['technology', 'communications', 'data_entry'],
    availability: 'now',
    home_base: 'Pinellas Park',
    opt_in_alerts: false,
    active_requests: 0,
    total_completed: 3
  }
]

export const mockResources = [
  {
    id: '1',
    name: 'St. Petersburg Emergency Shelter',
    resource_type: 'shelter',
    status: 'open',
    hours: '24/7',
    capacity: 300,
    current_occupancy: 180,
    contact_phone: '(727) 555-0100',
    address: 'Downtown St. Petersburg',
    details: {
      pet_friendly: true,
      wheelchair_accessible: true,
      registration_required: false
    }
  },
  {
    id: '2',
    name: 'Clearwater Community Kitchen',
    resource_type: 'kitchen',
    status: 'open',
    hours: '8:00 AM - 6:00 PM',
    capacity: 400,
    current_occupancy: 250,
    contact_phone: '(727) 555-0101',
    address: 'Clearwater Community Center',
    details: {
      dietary_restrictions: ['vegetarian', 'gluten_free'],
      takeout_available: true
    }
  },
  {
    id: '3',
    name: 'Pinellas Park Equipment Center',
    resource_type: 'equipment',
    status: 'open',
    hours: '6:00 AM - 8:00 PM',
    capacity: null,
    current_occupancy: null,
    contact_phone: '(727) 555-0102',
    address: 'Pinellas Park Municipal Building',
    details: {
      available_equipment: ['generators', 'chainsaws', 'pumps', 'tarps'],
      id_required: true
    }
  },
  {
    id: '4',
    name: 'Largo Water Distribution',
    resource_type: 'water',
    status: 'open',
    hours: '7:00 AM - 7:00 PM',
    capacity: null,
    current_occupancy: null,
    contact_phone: '(727) 555-0103',
    address: 'Largo Central Park',
    details: {
      bottled_water: true,
      limit_per_family: '2 cases',
      drive_through: true
    }
  },
  {
    id: '5',
    name: 'Seminole High School Shelter',
    resource_type: 'shelter',
    status: 'full',
    hours: '24/7',
    capacity: 200,
    current_occupancy: 200,
    contact_phone: '(727) 555-0106',
    address: 'Seminole High School Gymnasium',
    details: {
      pet_friendly: false,
      wheelchair_accessible: true,
      registration_required: true
    }
  }
]

export const mockAlerts = [
  {
    id: '1',
    alert_type: 'resource_opened',
    title: 'New Food Distribution Site Open',
    message: 'A new food distribution site is now open at Clearwater Community Kitchen. Free meals and groceries available from 8 AM to 6 PM today.',
    radius_km: 5.0,
    audience: 'both',
    dispatch_channel: 'email',
    dispatched_at: '2024-10-01T09:30:00Z',
    recipients_count: 47
  },
  {
    id: '2',
    alert_type: 'safety',
    title: 'Road Closure Alert',
    message: 'Gulf Blvd between 1st Ave and 5th Ave is closed due to flooding. Use alternate routes. Estimated reopening: 6 PM today.',
    radius_km: 3.0,
    audience: 'residents',
    dispatch_channel: 'both',
    dispatched_at: '2024-10-01T07:15:00Z',
    recipients_count: 23
  },
  {
    id: '3',
    alert_type: 'resource_closed',
    title: 'Shelter at Capacity',
    message: 'Seminole High School Shelter is now at full capacity. Alternative shelter available at St. Petersburg Emergency Shelter.',
    radius_km: 8.0,
    audience: 'both',
    dispatch_channel: 'email',
    dispatched_at: '2024-09-30T20:45:00Z',
    recipients_count: 82
  }
]