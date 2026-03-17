import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Package,
  ShoppingBag,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { OrderItem } from "../backend.d";
import { useCart } from "../context/CartContext";
import { usePlaceOrder } from "../hooks/useQueries";

interface CheckoutPageProps {
  onNavigateHome: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  prescriptionMedicines: "Prescription",
  otcMedicines: "OTC",
  healthSupplements: "Supplements",
  personalCare: "Personal Care",
  babyCare: "Baby Care",
  medicalDevices: "Devices",
};

interface LocalOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  createdAt: number;
  status: "pending";
}

function saveOrderToLocalStorage(order: LocalOrder) {
  try {
    const raw = localStorage.getItem("vm_orders");
    const existing: LocalOrder[] = raw ? (JSON.parse(raw) as LocalOrder[]) : [];
    existing.unshift(order);
    localStorage.setItem("vm_orders", JSON.stringify(existing));
  } catch {
    // ignore storage errors
  }
}

export default function CheckoutPage({ onNavigateHome }: CheckoutPageProps) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const placeOrderMutation = usePlaceOrder();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
  }>({});
  const [orderId, setOrderId] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!customerName.trim()) newErrors.name = "Full name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(phone.trim()))
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    if (!address.trim()) newErrors.address = "Delivery address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderItems: OrderItem[] = cartItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: BigInt(item.quantity),
      price: item.product.price,
    }));

    try {
      const newOrderId = await placeOrderMutation.mutateAsync({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: orderItems,
        totalAmount: cartTotal,
      });

      // Save to localStorage for admin CUSTOMER ORDERS panel
      const localOrder: LocalOrder = {
        id: String(newOrderId),
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: cartItems.map((item) => ({
          productId: String(item.product.id),
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: cartTotal,
        createdAt: Date.now(),
        status: "pending",
      };
      saveOrderToLocalStorage(localOrder);

      clearCart();
      setOrderId(String(newOrderId));
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────
  if (orderId !== null) {
    return (
      <div className="min-h-screen bg-background font-body flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full text-center"
          data-ocid="checkout.success.panel"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Order Placed!
          </h1>
          <p className="text-muted-foreground font-body mb-2">
            Thank you for your order. We'll prepare your medicines right away.
          </p>
          <div className="bg-card border border-border rounded-xl px-6 py-4 mb-6 inline-block">
            <p className="text-xs text-muted-foreground font-ui mb-1">
              Order ID
            </p>
            <p className="font-display text-xl font-bold text-medical-blue">
              #{orderId}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            Our team will contact you at{" "}
            <span className="font-semibold text-foreground">{phone}</span> to
            confirm your order.
          </p>
          <Button
            className="bg-medical-blue hover:bg-medical-blue-dark text-white font-ui font-semibold h-11 px-8"
            onClick={onNavigateHome}
            data-ocid="checkout.back.button"
          >
            Back to Store
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Empty Cart Guard ────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background font-body flex items-center justify-center px-4">
        <div className="text-center" data-ocid="checkout.empty_state">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Add some medicines to your cart before checking out.
          </p>
          <Button
            className="bg-medical-blue hover:bg-medical-blue-dark text-white font-ui"
            onClick={onNavigateHome}
            data-ocid="checkout.back_empty.button"
          >
            Browse Medicines
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateHome}
            className="font-ui text-muted-foreground hover:text-foreground"
            data-ocid="checkout.back.button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-medical-blue" />
            <span className="font-ui font-bold text-foreground">Checkout</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-5 gap-8"
        >
          {/* ── Order Summary ─────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs sticky top-24">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-medical-blue" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div
                    key={String(item.product.id)}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-ui font-medium text-sm text-foreground line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        {CATEGORY_LABELS[item.product.category] ??
                          item.product.category}{" "}
                        × {item.quantity}
                      </p>
                    </div>
                    <span className="font-ui font-semibold text-sm text-foreground shrink-0">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="font-ui font-semibold text-foreground">
                  Total Amount
                </span>
                <span className="font-display text-2xl font-bold text-medical-blue">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Customer Details Form ──────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
              <h2 className="font-display text-lg font-bold text-foreground mb-6">
                Delivery Details
              </h2>

              <div className="space-y-5">
                <div>
                  <Label
                    htmlFor="customer-name"
                    className="font-ui font-medium mb-1.5 block text-sm"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="customer-name"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Enter your full name"
                    className={`font-body h-11 ${errors.name ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-medical-blue"}`}
                    data-ocid="checkout.name.input"
                  />
                  {errors.name && (
                    <p
                      className="text-destructive text-xs mt-1 font-body"
                      data-ocid="checkout.name.error_state"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="customer-phone"
                    className="font-ui font-medium mb-1.5 block text-sm"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone)
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="10-digit mobile number (e.g. 9876543210)"
                    className={`font-body h-11 ${errors.phone ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-medical-blue"}`}
                    data-ocid="checkout.phone.input"
                  />
                  {errors.phone && (
                    <p
                      className="text-destructive text-xs mt-1 font-body"
                      data-ocid="checkout.phone.error_state"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="delivery-address"
                    className="font-ui font-medium mb-1.5 block text-sm"
                  >
                    Delivery Address *
                  </Label>
                  <Textarea
                    id="delivery-address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address)
                        setErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                    placeholder="House/Flat number, Street, Area, City, State, PIN code"
                    rows={4}
                    className={`font-body resize-none ${errors.address ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-medical-blue"}`}
                    data-ocid="checkout.address.textarea"
                  />
                  {errors.address && (
                    <p
                      className="text-destructive text-xs mt-1 font-body"
                      data-ocid="checkout.address.error_state"
                    >
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-700 font-body">
                    <span className="font-semibold">Note:</span> Our pharmacist
                    will call to confirm your order and provide delivery
                    details. Prescription medicines require a valid prescription
                    at delivery.
                  </p>
                </div>

                <Button
                  className="w-full bg-medical-blue hover:bg-medical-blue-dark text-white font-ui font-semibold h-12 text-base"
                  onClick={handlePlaceOrder}
                  disabled={placeOrderMutation.isPending}
                  data-ocid="checkout.place_order.button"
                >
                  {placeOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>Place Order — ₹{cartTotal.toFixed(2)}</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
