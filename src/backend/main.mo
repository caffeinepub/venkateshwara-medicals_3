import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Category = {
    #prescriptionMedicines;
    #otcMedicines;
    #healthSupplements;
    #personalCare;
    #babyCare;
    #medicalDevices;
  };

  public type Product = {
    id : Nat;
    name : Text;
    category : Category;
    description : Text;
    price : Float;
    inStock : Bool;
    featured : Bool;
  };

  module ProductModule {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };

    public func compareByName(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.name, p2.name);
    };

    public func compareByPrice(p1 : Product, p2 : Product) : Order.Order {
      Float.compare(p1.price, p2.price);
    };
  };

  let products = Map.empty<Nat, Product>();
  var nextProductId : Nat = 36;

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.notEqual(user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type OrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    price : Float;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #delivered;
  };

  public type Order = {
    id : Nat;
    customerName : Text;
    phone : Text;
    address : Text;
    items : [OrderItem];
    totalAmount : Float;
    createdAt : Int;
    status : OrderStatus;
  };

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  public shared ({ caller }) func placeOrder(
    customerName : Text,
    phone : Text,
    address : Text,
    items : [OrderItem],
    totalAmount : Float,
  ) : async Nat {
    if (customerName.isEmpty() or phone.isEmpty() or address.isEmpty()) {
      Runtime.trap("All customer fields are required");
    };

    if (items.size() == 0) {
      Runtime.trap("Order must contain at least one item");
    };

    let id = nextOrderId;
    nextOrderId += 1;

    let order : Order = {
      id;
      customerName;
      phone;
      address;
      items;
      totalAmount;
      createdAt = Time.now();
      status = #pending; // all orders start as PENDING
    };

    orders.add(id, order);
    id; // return order id to customer
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func addProduct(
    name : Text,
    category : Category,
    description : Text,
    price : Float,
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let id = nextProductId;
    nextProductId += 1;

    let product : Product = {
      id;
      name;
      category;
      description;
      price;
      inStock = true;
      featured = false; // new products are not featured by default
    };

    products.add(id, product);
    id;
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    category : Category,
    description : Text,
    price : Float,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existing) {
        let updated : Product = {
          id;
          name;
          category;
          description;
          price;
          inStock = existing.inStock;
          featured = existing.featured;
        };
        products.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.remove(id) };
    };
  };

  public shared ({ caller }) func toggleStockStatus(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle stock status");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updated : Product = {
          id = product.id;
          name = product.name;
          category = product.category;
          description = product.description;
          price = product.price;
          inStock = not product.inStock;
          featured = product.featured;
        };
        products.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func toggleFeaturedStatus(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle featured status");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updated : Product = {
          id = product.id;
          name = product.name;
          category = product.category;
          description = product.description;
          price = product.price;
          inStock = product.inStock;
          featured = not product.featured;
        };
        products.add(id, updated);
      };
    };
  };

  public query func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public query func getAllProducts() : async [Product] {
    let productsArray = products.values().toArray();
    productsArray.sort();
  };

  public query func getProductsByCategory(category : Category) : async [Product] {
    let productsArray = products.values().toArray();
    productsArray.filter<Product>(
      func(product) { product.category == category }
    );
  };

  public query func searchProductsByName(searchTerm : Text) : async [Product] {
    let productsArray = products.values().toArray();
    let normalizedSearchTerm = searchTerm.toLower();
    productsArray.filter<Product>(
      func(product) {
        product.name.toLower().contains(#text normalizedSearchTerm);
      }
    );
  };

  public query func getFeaturedProducts() : async [Product] {
    let productsArray = products.values().toArray();
    productsArray.filter<Product>(func(product) { product.featured });
  };

  public shared func seedSampleProducts() : async () {
    // Only seed if no products exist
    if (products.size() > 0) {
      return;
    };

    let samples : [Product] = [
      // Prescription Medicines (1-6)
      {
        id = 1;
        name = "Metformin 500mg Tablet (Glycomet)";
        category = #prescriptionMedicines;
        description = "oral antidiabetic";
        price = 28.5;
        inStock = true;
        featured = true;
      },
      {
        id = 2;
        name = "Atorvastatin 10mg Tablet (Atorva)";
        category = #prescriptionMedicines;
        description = "statin";
        price = 45;
        inStock = true;
        featured = false;
      },
      {
        id = 3;
        name = "Amlodipine 5mg Tablet (Amlokind)";
        category = #prescriptionMedicines;
        description = "calcium channel blocker";
        price = 38;
        inStock = true;
        featured = false;
      },
      {
        id = 4;
        name = "Pantoprazole 40mg Tablet (Pan D)";
        category = #prescriptionMedicines;
        description = "proton pump inhibitor";
        price = 55;
        inStock = true;
        featured = true;
      },
      {
        id = 5;
        name = "Azithromycin 500mg Tablet (Azithral)";
        category = #prescriptionMedicines;
        description = "antibiotic";
        price = 84;
        inStock = true;
        featured = false;
      },
      {
        id = 6;
        name = "Cetirizine 10mg Tablet (Cetzine)";
        category = #prescriptionMedicines;
        description = "antihistamine";
        price = 22;
        inStock = true;
        featured = false;
      },

      // OTC Medicines (7-12)
      {
        id = 7;
        name = "Crocin Advance 500mg Tablet";
        category = #otcMedicines;
        description = "paracetamol";
        price = 30;
        inStock = true;
        featured = true;
      },
      {
        id = 8;
        name = "Vicks VapoRub 50ml";
        category = #otcMedicines;
        description = "topical ointment";
        price = 110;
        inStock = true;
        featured = true;
      },
      {
        id = 9;
        name = "Gelusil MPS Antacid Tablet";
        category = #otcMedicines;
        description = "antacid";
        price = 95;
        inStock = true;
        featured = false;
      },
      {
        id = 10;
        name = "Dettol Antiseptic Liquid 250ml";
        category = #otcMedicines;
        description = "antiseptic liquid";
        price = 115;
        inStock = true;
        featured = false;
      },
      {
        id = 11;
        name = "Volini Pain Relief Gel 30g";
        category = #otcMedicines;
        description = "topical gel";
        price = 140;
        inStock = true;
        featured = false;
      },
      {
        id = 12;
        name = "Electral ORS Powder Orange 21.8g";
        category = #otcMedicines;
        description = "oral rehydration salt";
        price = 25;
        inStock = true;
        featured = false;
      },

      // Health Supplements (13-18)
      {
        id = 13;
        name = "Revital H for Men (30 Capsules)";
        category = #healthSupplements;
        description = "multivitamin";
        price = 320;
        inStock = true;
        featured = true;
      },
      {
        id = 14;
        name = "Vitamin D3 1000 IU Tablet (60s)";
        category = #healthSupplements;
        description = "vitamin D3 supplement";
        price = 199;
        inStock = true;
        featured = false;
      },
      {
        id = 15;
        name = "Calcium Sandoz Forte 500mg (30 Tablets)";
        category = #healthSupplements;
        description = "calcium supplement";
        price = 265;
        inStock = true;
        featured = false;
      },
      {
        id = 16;
        name = "Omega-3 Fish Oil 1000mg (60 Softgels)";
        category = #healthSupplements;
        description = "omega-3 fish oil";
        price = 450;
        inStock = true;
        featured = true;
      },
      {
        id = 17;
        name = "Protinex Original Powder 400g";
        category = #healthSupplements;
        description = "nutritional drink";
        price = 599;
        inStock = true;
        featured = false;
      },
      {
        id = 18;
        name = "Centrum Adults Multivitamin (30 Tablets)";
        category = #healthSupplements;
        description = "multivitamin";
        price = 375;
        inStock = true;
        featured = false;
      },

      // Personal Care (19-24)
      {
        id = 19;
        name = "Himalaya Purifying Neem Face Wash 150ml";
        category = #personalCare;
        description = "face wash";
        price = 130;
        inStock = true;
        featured = true;
      },
      {
        id = 20;
        name = "Dove Beauty Cream Bar 100g (Pack of 3)";
        category = #personalCare;
        description = "moisturising soap bar";
        price = 165;
        inStock = true;
        featured = false;
      },
      {
        id = 21;
        name = "Colgate Strong Teeth Toothpaste 200g";
        category = #personalCare;
        description = "toothpaste";
        price = 110;
        inStock = true;
        featured = false;
      },
      {
        id = 22;
        name = "Head & Shoulders Anti-Dandruff Shampoo 340ml";
        category = #personalCare;
        description = "anti-dandruff shampoo";
        price = 310;
        inStock = true;
        featured = false;
      },
      {
        id = 23;
        name = "Dettol Original Hand Wash 250ml";
        category = #personalCare;
        description = "hand wash";
        price = 99;
        inStock = true;
        featured = false;
      },
      {
        id = 24;
        name = "Nivea Soft Moisturising Cream 200ml";
        category = #personalCare;
        description = "moisturising cream";
        price = 235;
        inStock = true;
        featured = false;
      },

      // Baby Care (25-29)
      {
        id = 25;
        name = "Johnson's Baby Powder 200g";
        category = #babyCare;
        description = "baby powder";
        price = 175;
        inStock = true;
        featured = true;
      },
      {
        id = 26;
        name = "Pampers Active Baby Pants Large (42 Count)";
        category = #babyCare;
        description = "diaper pants";
        price = 899;
        inStock = true;
        featured = true;
      },
      {
        id = 27;
        name = "Nestle Cerelac Baby Cereal Wheat 300g";
        category = #babyCare;
        description = "infant cereal";
        price = 265;
        inStock = true;
        featured = false;
      },
      {
        id = 28;
        name = "Nan Pro 1 Infant Formula 400g";
        category = #babyCare;
        description = "infant formula";
        price = 750;
        inStock = true;
        featured = false;
      },
      {
        id = 29;
        name = "Himalaya Baby Massage Oil 200ml";
        category = #babyCare;
        description = "baby massage oil";
        price = 185;
        inStock = true;
        featured = false;
      },

      // Medical Devices (30-35)
      {
        id = 30;
        name = "Omron HEM-7120 Blood Pressure Monitor";
        category = #medicalDevices;
        description = "blood pressure monitor";
        price = 1999;
        inStock = true;
        featured = true;
      },
      {
        id = 31;
        name = "Dr. Morepen BG-03 Glucometer Kit";
        category = #medicalDevices;
        description = "blood glucose monitor";
        price = 649;
        inStock = true;
        featured = true;
      },
      {
        id = 32;
        name = "Dr. Trust Digital Thermometer";
        category = #medicalDevices;
        description = "digital thermometer";
        price = 199;
        inStock = true;
        featured = false;
      },
      {
        id = 33;
        name = "Dr. Trust Pulse Oximeter";
        category = #medicalDevices;
        description = "pulse oximeter";
        price = 999;
        inStock = true;
        featured = false;
      },
      {
        id = 34;
        name = "Omron NE-C28 Nebulizer";
        category = #medicalDevices;
        description = "nebulizer";
        price = 2499;
        inStock = true;
        featured = false;
      },
      {
        id = 35;
        name = "Vissco Knee Cap Support (Medium)";
        category = #medicalDevices;
        description = "knee support";
        price = 349;
        inStock = true;
        featured = false;
      },
    ];

    for (product in samples.vals()) {
      products.add(product.id, product);
    };

    nextProductId := 36;
  };
};
