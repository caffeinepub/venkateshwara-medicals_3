import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../context/CartContext";

const CATEGORY_LABELS: Record<string, string> = {
  prescriptionMedicines: "Prescription",
  otcMedicines: "OTC",
  healthSupplements: "Supplements",
  personalCare: "Personal Care",
  babyCare: "Baby Care",
  medicalDevices: "Devices",
};

const CATEGORY_COLORS: Record<string, string> = {
  prescriptionMedicines: "text-blue-700 border-blue-200 bg-blue-50",
  otcMedicines: "text-emerald-700 border-emerald-200 bg-emerald-50",
  healthSupplements: "text-rose-700 border-rose-200 bg-rose-50",
  personalCare: "text-purple-700 border-purple-200 bg-purple-50",
  babyCare: "text-pink-700 border-pink-200 bg-pink-50",
  medicalDevices: "text-slate-700 border-slate-200 bg-slate-50",
};

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  open,
  onClose,
  onCheckout,
}: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } =
    useCart();

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 font-body"
        data-ocid="cart.sheet"
      >
        <SheetHeader className="px-6 py-4 border-b border-border shrink-0">
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-medical-blue" />
            Your Cart
            {cartCount > 0 && (
              <span className="ml-auto text-sm font-ui font-medium text-muted-foreground">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div
            className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center"
            data-ocid="cart.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="font-ui font-semibold text-foreground mb-1">
              Your cart is empty
            </p>
            <p className="text-sm text-muted-foreground">
              Add medicines to your cart to get started
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-4">
                <AnimatePresence initial={false}>
                  {cartItems.map((item, idx) => (
                    <motion.div
                      key={String(item.product.id)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3 items-start bg-card rounded-xl border border-border p-4 shadow-xs"
                      data-ocid={`cart.item.${idx + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-ui font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">
                          {item.product.name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs mb-2 ${CATEGORY_COLORS[item.product.category] ?? "text-slate-700 border-slate-200 bg-slate-50"}`}
                        >
                          {CATEGORY_LABELS[item.product.category] ??
                            item.product.category}
                        </Badge>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                              className="w-7 h-7 rounded-md border border-border bg-background hover:bg-muted flex items-center justify-center text-foreground transition-colors"
                              data-ocid={`cart.decrease.button.${idx + 1}`}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span
                              className="w-8 text-center font-ui font-semibold text-sm text-foreground"
                              data-ocid={`cart.quantity.${idx + 1}`}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
                              className="w-7 h-7 rounded-md border border-border bg-background hover:bg-muted flex items-center justify-center text-foreground transition-colors"
                              data-ocid={`cart.increase.button.${idx + 1}`}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-display font-bold text-medical-blue text-sm">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="shrink-0 w-7 h-7 rounded-md hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-muted-foreground transition-colors"
                        data-ocid={`cart.remove.button.${idx + 1}`}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-border shrink-0 space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-ui font-semibold text-foreground">
                  Subtotal
                </span>
                <span className="font-display text-xl font-bold text-medical-blue">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Taxes and delivery charges calculated at checkout
              </p>
              <Button
                className="w-full bg-medical-blue hover:bg-medical-blue-dark text-white font-ui font-semibold h-11"
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                data-ocid="cart.checkout.button"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
