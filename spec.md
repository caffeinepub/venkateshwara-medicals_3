# Venkateshwara Medicals

## Current State
Full-stack medical store app with:
- Motoko backend with product catalog (6 categories, CRUD, seed function with only 5 basic sample products)
- React frontend with homepage, product browsing, search/filter, and admin panel with username/password login
- Categories: Prescription Medicines, OTC Medicines, Health Supplements, Personal Care, Baby Care, Medical Devices

## Requested Changes (Diff)

### Add
- 30+ realistic sample products across all 6 categories, inspired by Apollo Pharmacy and Tata 1mg product listings
- Products should include real medicine/product names, accurate Indian prices (in Rs.), and realistic descriptions
- Each category should have 4-6 representative products

### Modify
- Backend: Replace the 5-product seed data with a rich catalog of 30+ products
- Ensure a mix of featured and non-featured products, all in stock

### Remove
- Nothing removed

## Implementation Plan
1. Update `seedSampleProducts` in `main.mo` to include 30+ realistic products across all categories:
   - Prescription Medicines: Metformin, Atorvastatin, Amlodipine, Pantoprazole, Azithromycin, Cetirizine
   - OTC Medicines: Crocin, Vicks VapoRub, Gelusil, Dettol Antiseptic, Volini Gel, ORS Electral
   - Health Supplements: Revital H, Vitamin D3, Calcium Sandoz, Omega-3 Fish Oil, Protinex, Centrum
   - Personal Care: Himalaya Face Wash, Dove Soap, Colgate, Head & Shoulders, Dettol Hand Wash, Nivea Cream
   - Baby Care: Johnson's Baby Powder, Pampers Diapers, Cerelac, Lactogen Formula, Desitin Rash Cream
   - Medical Devices: BP Monitor, Glucometer, Digital Thermometer, Pulse Oximeter, Nebulizer
2. Update nextProductId accordingly
