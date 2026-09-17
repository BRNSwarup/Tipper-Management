// Realistic Transport Business Demo Dataset (10-50 Trucks Fleet Scale)

export const initialSeedData = {
  trucks: [
    {
      id: "trk-101",
      registration_number: "MH-12-PQ-4821",
      chassis_number: "MAT4820192849102",
      engine_number: "ENG-8829102-X",
      make_model: "Tata Prima 3530.K",
      truck_type: "tipper",
      capacity_tons: 25.00,
      axles: 4,
      ownership_type: "owned",
      purchase_date: "2023-03-15",
      current_odometer: 142500,
      status: "on_trip",
      created_at: "2023-03-15T10:00:00Z"
    },
    {
      id: "trk-102",
      registration_number: "KA-01-MJ-9912",
      chassis_number: "MAT9912048102941",
      engine_number: "ENG-7739102-B",
      make_model: "BharatBenz 2823R",
      truck_type: "container",
      capacity_tons: 18.50,
      axles: 3,
      ownership_type: "owned",
      purchase_date: "2022-08-10",
      current_odometer: 189300,
      status: "available",
      created_at: "2022-08-10T10:00:00Z"
    },
    {
      id: "trk-103",
      registration_number: "TN-09-CB-3341",
      chassis_number: "MAT3341029481029",
      engine_number: "ENG-6638102-C",
      make_model: "Ashok Leyland 5525 TT",
      truck_type: "trailer",
      capacity_tons: 35.00,
      axles: 5,
      ownership_type: "owned",
      purchase_date: "2021-11-20",
      current_odometer: 245000,
      status: "on_trip",
      created_at: "2021-11-20T10:00:00Z"
    },
    {
      id: "trk-104",
      registration_number: "HR-55-AB-7711",
      chassis_number: "MAT7711928410293",
      engine_number: "ENG-5529102-D",
      make_model: "Tata Signa 4825.TK",
      truck_type: "open",
      capacity_tons: 28.00,
      axles: 5,
      ownership_type: "attached",
      purchase_date: "2023-01-05",
      current_odometer: 112000,
      status: "maintenance",
      created_at: "2023-01-05T10:00:00Z"
    },
    {
      id: "trk-105",
      registration_number: "GJ-06-ZZ-4009",
      chassis_number: "MAT4009284102938",
      engine_number: "ENG-4419102-E",
      make_model: "Mahindra Blazo X 49",
      truck_type: "container",
      capacity_tons: 30.00,
      axles: 4,
      ownership_type: "owned",
      purchase_date: "2022-04-18",
      current_odometer: 168400,
      status: "available",
      created_at: "2022-04-18T10:00:00Z"
    },
    {
      id: "trk-106",
      registration_number: "DL-1M-AA-5520",
      chassis_number: "MAT5520192840192",
      engine_number: "ENG-3319102-F",
      make_model: "Eicher Pro 6055",
      truck_type: "flatbed",
      capacity_tons: 32.00,
      axles: 4,
      ownership_type: "owned",
      purchase_date: "2023-07-22",
      current_odometer: 98400,
      status: "on_trip",
      created_at: "2023-07-22T10:00:00Z"
    },
    {
      id: "trk-107",
      registration_number: "AP-39-TX-8801",
      chassis_number: "MAT8801928401928",
      engine_number: "ENG-2219102-G",
      make_model: "BharatBenz 3528CM",
      truck_type: "tipper",
      capacity_tons: 24.00,
      axles: 4,
      ownership_type: "attached",
      purchase_date: "2023-09-01",
      current_odometer: 76200,
      status: "available",
      created_at: "2023-09-01T10:00:00Z"
    },
    {
      id: "trk-108",
      registration_number: "WB-23-CD-1192",
      chassis_number: "MAT1192840192839",
      engine_number: "ENG-1119102-H",
      make_model: "Tata LPT 2818",
      truck_type: "open",
      capacity_tons: 16.00,
      axles: 3,
      ownership_type: "owned",
      purchase_date: "2020-05-14",
      current_odometer: 298000,
      status: "inactive",
      created_at: "2020-05-14T10:00:00Z"
    }
  ],

  drivers: [
    {
      id: "drv-201",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "rajesh.kumar@fleet.com",
      licence_number: "MH-1220180094812",
      licence_expiry_date: "2026-10-15", // Valid
      address: "Flat 202, Shiv Shahi Society, Nigdi, Pune, Maharashtra",
      joining_date: "2022-01-10",
      salary_type: "per_trip",
      rate: 3500.00,
      assigned_truck_id: "trk-101",
      status: "on_trip",
      created_at: "2022-01-10T10:00:00Z"
    },
    {
      id: "drv-202",
      name: "Gurpreet Singh",
      phone: "+91 98123 88491",
      email: "gurpreet.s@fleet.com",
      licence_number: "PB-6520160083921",
      licence_expiry_date: "2026-09-22", // Expiring in 5 days!
      address: "Village GT Road, Ambala, Punjab",
      joining_date: "2021-06-15",
      salary_type: "monthly",
      rate: 28000.00,
      assigned_truck_id: "trk-103",
      status: "on_trip",
      created_at: "2021-06-15T10:00:00Z"
    },
    {
      id: "drv-203",
      name: "Ramesh Patel",
      phone: "+91 99887 11223",
      email: "ramesh.patel@fleet.com",
      licence_number: "GJ-0120190011928",
      licence_expiry_date: "2026-09-30", // Expiring in 13 days!
      address: "Sector 4, Gandhinagar, Gujarat",
      joining_date: "2022-09-01",
      salary_type: "per_km",
      rate: 4.50,
      assigned_truck_id: "trk-102",
      status: "active",
      created_at: "2022-09-01T10:00:00Z"
    },
    {
      id: "drv-204",
      name: "Suresh Sharma",
      phone: "+91 97654 33211",
      email: "suresh.sharma@fleet.com",
      licence_number: "HR-2620150077812",
      licence_expiry_date: "2026-09-10", // Expired 7 days ago!
      address: "House 104, Model Town, Rewari, Haryana",
      joining_date: "2023-02-10",
      salary_type: "monthly",
      rate: 25000.00,
      assigned_truck_id: "trk-104",
      status: "on_leave",
      created_at: "2023-02-10T10:00:00Z"
    },
    {
      id: "drv-205",
      name: "Venkat Raman",
      phone: "+91 94432 10987",
      email: "venkat.r@fleet.com",
      licence_number: "TN-0120200049201",
      licence_expiry_date: "2027-04-18",
      address: "12 Cross Road, T Nagar, Chennai, Tamil Nadu",
      joining_date: "2023-08-01",
      salary_type: "per_trip",
      rate: 4000.00,
      assigned_truck_id: "trk-106",
      status: "on_trip",
      created_at: "2023-08-01T10:00:00Z"
    }
  ],

  parties: [
    {
      id: "pty-301",
      name: "UltraTech Cement Ltd",
      party_type: "consignor",
      gstin: "27AAACU9812K1Z5",
      phone: "+91 22 6691 7000",
      address: "Ahura Centre, Mahakali Caves Road, Andheri East, Mumbai, MH",
      credit_days: 30,
      created_at: "2022-01-01T10:00:00Z"
    },
    {
      id: "pty-302",
      name: "Reliance Logistics Division",
      party_type: "consignor",
      gstin: "24AABCR1892M1ZX",
      phone: "+91 79 3500 2000",
      address: "Reliance Complex, Hazira, Surat, Gujarat",
      credit_days: 45,
      created_at: "2022-03-10T10:00:00Z"
    },
    {
      id: "pty-303",
      name: "Tata Steel Freight Yard",
      party_type: "consignee",
      gstin: "20AAACT0921P1Z9",
      phone: "+91 657 243 1234",
      address: "Jamshedpur Works, Jamshedpur, Jharkhand",
      credit_days: 30,
      created_at: "2022-05-15T10:00:00Z"
    },
    {
      id: "pty-304",
      name: "Amazon Transportation Services",
      party_type: "consignor",
      gstin: "29AABCA9918E1Z3",
      phone: "+91 80 4000 5000",
      address: "Brigade Gateway, Malleshwaram West, Bengaluru, KA",
      credit_days: 15,
      created_at: "2023-01-20T10:00:00Z"
    },
    {
      id: "pty-305",
      name: "Shree Ram Transport Brokerage",
      party_type: "broker",
      gstin: "27BCKPR8812N1Z4",
      phone: "+91 98200 99887",
      address: "Transport Nagar, Nigdi, Pune, Maharashtra",
      credit_days: 15,
      created_at: "2022-10-05T10:00:00Z"
    },
    {
      id: "pty-306",
      name: "HPCL Fuel & Auto Spare Vendor",
      party_type: "vendor",
      gstin: "27AAACH0091L1Z8",
      phone: "+91 22 2286 3900",
      address: "Petroleum House, 17 Jamshedji Tata Road, Mumbai, MH",
      credit_days: 7,
      created_at: "2022-02-14T10:00:00Z"
    }
  ],

  trips: [
    {
      id: "trp-401",
      trip_number: "TRP-2026-089",
      truck_id: "trk-101",
      driver_id: "drv-201",
      party_id: "pty-301",
      source_city: "Mumbai, MH",
      destination_city: "Bengaluru, KA",
      lr_number: "LR-9948102",
      goods_description: "Portland Cement Bags (1200 Bags)",
      weight_tons: 24.50,
      start_date: "2026-09-12",
      end_date: null,
      starting_odometer: 141500,
      ending_odometer: 0,
      freight_amount: 115000.00,
      driver_advance: 25000.00,
      pod_file_url: null,
      status: "running",
      created_at: "2026-09-12T08:30:00Z"
    },
    {
      id: "trp-402",
      trip_number: "TRP-2026-088",
      truck_id: "trk-103",
      driver_id: "drv-202",
      party_id: "pty-302",
      source_city: "Surat, GJ",
      destination_city: "Chennai, TN",
      lr_number: "LR-9948088",
      goods_description: "Polymer Granules Containers",
      weight_tons: 32.00,
      start_date: "2026-09-10",
      end_date: null,
      starting_odometer: 243800,
      ending_odometer: 0,
      freight_amount: 168000.00,
      driver_advance: 35000.00,
      pod_file_url: null,
      status: "running",
      created_at: "2026-09-10T09:15:00Z"
    },
    {
      id: "trp-403",
      trip_number: "TRP-2026-087",
      truck_id: "trk-106",
      driver_id: "drv-205",
      party_id: "pty-304",
      source_city: "Delhi NCR",
      destination_city: "Hyderabad, TS",
      lr_number: "LR-9948077",
      goods_description: "Ecommerce Consumer Electronics Freight",
      weight_tons: 28.00,
      start_date: "2026-09-08",
      end_date: "2026-09-14",
      starting_odometer: 96800,
      ending_odometer: 98400,
      freight_amount: 145000.00,
      driver_advance: 30000.00,
      pod_file_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
      status: "delivered",
      created_at: "2026-09-08T07:00:00Z"
    },
    {
      id: "trp-404",
      trip_number: "TRP-2026-086",
      truck_id: "trk-102",
      driver_id: "drv-203",
      party_id: "pty-301",
      source_city: "Pune, MH",
      destination_city: "Ahmedabad, GJ",
      lr_number: "LR-9948066",
      goods_description: "Building Material & Clinker",
      weight_tons: 18.00,
      start_date: "2026-09-01",
      end_date: "2026-09-06",
      starting_odometer: 188600,
      ending_odometer: 189300,
      freight_amount: 72000.00,
      driver_advance: 15000.00,
      pod_file_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600",
      status: "billed",
      created_at: "2026-09-01T10:00:00Z"
    },
    {
      id: "trp-405",
      trip_number: "TRP-2026-085",
      truck_id: "trk-105",
      driver_id: "drv-203",
      party_id: "pty-303",
      source_city: "Jamshedpur, JH",
      destination_city: "Mumbai, MH",
      lr_number: "LR-9948055",
      goods_description: "Steel Coils & Rods",
      weight_tons: 29.50,
      start_date: "2026-08-25",
      end_date: "2026-08-30",
      starting_odometer: 166500,
      ending_odometer: 168400,
      freight_amount: 155000.00,
      driver_advance: 30000.00,
      pod_file_url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600",
      status: "closed",
      created_at: "2026-08-25T11:20:00Z"
    }
  ],

  tripExpenses: [
    {
      id: "exp-501",
      trip_id: "trp-401",
      category: "fuel",
      amount: 42000.00,
      paid_by: "driver",
      date: "2026-09-12",
      remarks: "Fueling 440 Litres at HPCL Kolhapur Highway",
      receipt_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600"
    },
    {
      id: "exp-502",
      trip_id: "trp-401",
      category: "toll",
      amount: 4800.00,
      paid_by: "driver",
      date: "2026-09-13",
      remarks: "FASTag toll deducts Pune-Bengaluru NH4",
      receipt_url: null
    },
    {
      id: "exp-503",
      trip_id: "trp-401",
      category: "driver_bata",
      amount: 2500.00,
      paid_by: "driver",
      date: "2026-09-13",
      remarks: "Driver food & daily bata allowance (5 days)",
      receipt_url: null
    },
    {
      id: "exp-504",
      trip_id: "trp-401",
      category: "loading",
      amount: 1800.00,
      paid_by: "office",
      date: "2026-09-12",
      remarks: "Loading labor charges paid at plant yard",
      receipt_url: null
    },
    {
      id: "exp-505",
      trip_id: "trp-403",
      category: "fuel",
      amount: 55000.00,
      paid_by: "office",
      date: "2026-09-08",
      remarks: "Bulk fuel card payment HPCL Delhi",
      receipt_url: null
    },
    {
      id: "exp-506",
      trip_id: "trp-403",
      category: "toll",
      amount: 6200.00,
      paid_by: "driver",
      date: "2026-09-10",
      remarks: "Agra Expressway & Jhansi-Nagpur toll",
      receipt_url: null
    },
    {
      id: "exp-507",
      trip_id: "trp-403",
      category: "unloading",
      amount: 2200.00,
      paid_by: "driver",
      date: "2026-09-14",
      remarks: "Unloading crane assistance Hyderabad hub",
      receipt_url: null
    }
  ],

  fuelEntries: [
    {
      id: "fl-601",
      truck_id: "trk-101",
      trip_id: "trp-401",
      date: "2026-09-12",
      odometer: 141800,
      litres: 350.00,
      rate_per_litre: 94.50,
      total_amount: 33075.00,
      fuel_pump: "HPCL Highway Plaza, Satara",
      payment_mode: "fuel_card",
      is_tank_full: true,
      mileage_kmpl: 3.42,
      created_at: "2026-09-12T12:00:00Z"
    },
    {
      id: "fl-602",
      truck_id: "trk-103",
      trip_id: "trp-402",
      date: "2026-09-10",
      odometer: 244200,
      litres: 480.00,
      rate_per_litre: 95.20,
      total_amount: 45696.00,
      fuel_pump: "IOCL Swastik Auto, Vadodara",
      payment_mode: "credit",
      is_tank_full: true,
      mileage_kmpl: 2.95,
      created_at: "2026-09-10T14:30:00Z"
    },
    {
      id: "fl-603",
      truck_id: "trk-102",
      trip_id: "trp-404",
      date: "2026-09-02",
      odometer: 188900,
      litres: 220.00,
      rate_per_litre: 93.80,
      total_amount: 20636.00,
      fuel_pump: "BPCL Express Service, Thane",
      payment_mode: "upi",
      is_tank_full: true,
      mileage_kmpl: 3.18,
      created_at: "2026-09-02T16:00:00Z"
    }
  ],

  maintenance: [
    {
      id: "mnt-701",
      truck_id: "trk-104",
      service_date: "2026-09-14",
      odometer: 112000,
      maintenance_type: "breakdown",
      workshop_name: "TVS Mobility Service Center, Ambala",
      description: "Clutch plate assembly replacement & flywheel turning",
      labour_cost: 6500.00,
      parts_cost: 28500.00,
      total_cost: 35000.00,
      downtime_days: 3,
      created_at: "2026-09-14T09:00:00Z"
    },
    {
      id: "mnt-702",
      truck_id: "trk-102",
      service_date: "2026-08-20",
      odometer: 187500,
      maintenance_type: "scheduled",
      workshop_name: "Authorized Tata Motors Service, Pune",
      description: "Engine oil change, air filter replacement, brake pad adjustment",
      labour_cost: 4000.00,
      parts_cost: 14200.00,
      total_cost: 18200.00,
      downtime_days: 1,
      created_at: "2026-08-20T10:00:00Z"
    }
  ],

  tyres: [
    {
      id: "tyr-801",
      serial_number: "MRF-99201-295R22.5",
      brand: "MRF Steel Muscle",
      purchase_date: "2024-02-10",
      cost: 26500.00,
      status: "fitted",
      assigned_truck_id: "trk-101",
      position: "FL",
      created_at: "2024-02-10T10:00:00Z"
    },
    {
      id: "tyr-802",
      serial_number: "MRF-99202-295R22.5",
      brand: "MRF Steel Muscle",
      purchase_date: "2024-02-10",
      cost: 26500.00,
      status: "fitted",
      assigned_truck_id: "trk-101",
      position: "FR",
      created_at: "2024-02-10T10:00:00Z"
    },
    {
      id: "tyr-803",
      serial_number: "APO-77102-1000R20",
      brand: "Apollo EnduRace RA",
      purchase_date: "2024-05-15",
      cost: 24800.00,
      status: "fitted",
      assigned_truck_id: "trk-101",
      position: "RL1",
      created_at: "2024-05-15T10:00:00Z"
    },
    {
      id: "tyr-804",
      serial_number: "JK-55102-1000R20",
      brand: "JK Tyre JETSTEEL",
      purchase_date: "2024-01-20",
      cost: 23500.00,
      status: "retreaded",
      assigned_truck_id: null,
      position: "SPARE",
      created_at: "2024-01-20T10:00:00Z"
    }
  ],

  tyreEvents: [
    {
      id: "te-851",
      tyre_id: "tyr-801",
      truck_id: "trk-101",
      event_type: "fitted",
      event_date: "2024-02-12",
      odometer: 95000,
      cost: 500.00,
      remarks: "New front left wheel alignment & fitting",
      created_at: "2024-02-12T10:00:00Z"
    },
    {
      id: "te-852",
      tyre_id: "tyr-804",
      truck_id: "trk-102",
      event_type: "retreaded",
      event_date: "2026-08-01",
      odometer: 186000,
      cost: 6200.00,
      remarks: "Cold retreading tread rubber application done at Bandag",
      created_at: "2026-08-01T10:00:00Z"
    }
  ],

  driverLedger: [
    {
      id: "dlg-901",
      driver_id: "drv-201",
      trip_id: "trp-401",
      entry_type: "advance",
      amount: 25000.00,
      direction: "debit", // Driver received advance money from office
      date: "2026-09-12",
      remarks: "Trip TRP-2026-089 starting advance cash",
      created_at: "2026-09-12T08:30:00Z"
    },
    {
      id: "dlg-902",
      driver_id: "drv-201",
      trip_id: "trp-401",
      entry_type: "expense_claim",
      amount: 46800.00,
      direction: "credit", // Driver spent cash for fuel & toll on behalf of office
      date: "2026-09-13",
      remarks: "Fuel & toll receipts submitted for reimbursement",
      created_at: "2026-09-13T14:00:00Z"
    },
    {
      id: "dlg-903",
      driver_id: "drv-205",
      trip_id: "trp-403",
      entry_type: "advance",
      amount: 30000.00,
      direction: "debit",
      date: "2026-09-08",
      remarks: "Delhi-Hyderabad trip advance",
      created_at: "2026-09-08T07:00:00Z"
    },
    {
      id: "dlg-904",
      driver_id: "drv-205",
      trip_id: "trp-403",
      entry_type: "bata",
      amount: 3500.00,
      direction: "credit",
      date: "2026-09-14",
      remarks: "7 days trip daily bata @ ₹500/day",
      created_at: "2026-09-14T18:00:00Z"
    }
  ],

  documents: [
    {
      id: "doc-1001",
      entity_type: "truck",
      entity_id: "trk-101",
      document_type: "rc",
      document_number: "RC-MH12PQ4821-EXP",
      issue_date: "2023-03-15",
      expiry_date: "2038-03-14", // Valid 12 yrs
      file_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600",
      created_at: "2023-03-15T10:00:00Z"
    },
    {
      id: "doc-1002",
      entity_type: "truck",
      entity_id: "trk-101",
      document_type: "insurance",
      document_number: "INS-ICICI-881920",
      issue_date: "2025-10-01",
      expiry_date: "2026-09-28", // Expiring in 11 days!
      file_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600",
      created_at: "2025-10-01T10:00:00Z"
    },
    {
      id: "doc-1003",
      entity_type: "truck",
      entity_id: "trk-103",
      document_type: "fitness",
      document_number: "FIT-TN09-99401",
      issue_date: "2025-09-20",
      expiry_date: "2026-09-21", // Expiring in 4 days!
      file_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600",
      created_at: "2025-09-20T10:00:00Z"
    },
    {
      id: "doc-1004",
      entity_type: "driver",
      entity_id: "drv-202",
      document_type: "driving_licence",
      document_number: "DL-PB65-20160083921",
      issue_date: "2016-09-23",
      expiry_date: "2026-09-22", // Expiring in 5 days!
      file_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600",
      created_at: "2021-06-15T10:00:00Z"
    },
    {
      id: "doc-1005",
      entity_type: "truck",
      entity_id: "trk-104",
      document_type: "national_permit",
      document_number: "NP-HR55-88102",
      issue_date: "2025-09-01",
      expiry_date: "2026-09-12", // Expired 5 days ago!
      file_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600",
      created_at: "2025-09-01T10:00:00Z"
    }
  ],

  invoices: [
    {
      id: "inv-1101",
      invoice_number: "INV-2026-004",
      party_id: "pty-301",
      invoice_date: "2026-09-07",
      due_date: "2026-10-07", // Outstanding 0-30 days
      taxable_amount: 72000.00,
      gst_rate: 5.00,
      gst_amount: 3600.00,
      total_amount: 75600.00,
      payment_status: "unpaid",
      created_at: "2026-09-07T10:00:00Z"
    },
    {
      id: "inv-1102",
      invoice_number: "INV-2026-003",
      party_id: "pty-303",
      invoice_date: "2026-08-15",
      due_date: "2026-09-15", // Overdue / Due today!
      taxable_amount: 155000.00,
      gst_rate: 5.00,
      gst_amount: 7750.00,
      total_amount: 162750.00,
      payment_status: "partially_paid",
      created_at: "2026-08-15T10:00:00Z"
    },
    {
      id: "inv-1103",
      invoice_number: "INV-2026-002",
      party_id: "pty-302",
      invoice_date: "2026-07-10",
      due_date: "2026-08-25", // Overdue 30-60 days
      taxable_amount: 120000.00,
      gst_rate: 5.00,
      gst_amount: 6000.00,
      total_amount: 126000.00,
      payment_status: "unpaid",
      created_at: "2026-07-10T10:00:00Z"
    },
    {
      id: "inv-1104",
      invoice_number: "INV-2026-001",
      party_id: "pty-304",
      invoice_date: "2026-06-01",
      due_date: "2026-06-16", // Overdue 90+ days!
      taxable_amount: 98000.00,
      gst_rate: 5.00,
      gst_amount: 4900.00,
      total_amount: 102900.00,
      payment_status: "unpaid",
      created_at: "2026-06-01T10:00:00Z"
    }
  ],

  invoiceTrips: [
    { id: "it-1201", invoice_id: "inv-1101", trip_id: "trp-404" },
    { id: "it-1202", invoice_id: "inv-1102", trip_id: "trp-405" }
  ],

  payments: [
    {
      id: "pmt-1301",
      invoice_id: "inv-1102",
      party_id: "pty-303",
      amount_paid: 100000.00,
      payment_date: "2026-08-28",
      payment_mode: "bank_transfer",
      reference_number: "UTR-NEFT-991820491",
      notes: "Part payment received for steel coils freight invoice",
      created_at: "2026-08-28T14:00:00Z"
    }
  ]
};
