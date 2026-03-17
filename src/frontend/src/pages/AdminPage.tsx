import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle,
  ClipboardList,
  Database,
  Loader2,
  LogOut,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Shield,
  ShoppingBag,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  Category,
  useAddProduct,
  useAllProducts,
  useDeleteProduct,
  useSeedSampleProducts,
  useToggleFeaturedStatus,
  useToggleStockStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

interface AdminPageProps {
  onNavigateHome: () => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.prescriptionMedicines]: "Prescription Medicines",
  [Category.otcMedicines]: "OTC Medicines",
  [Category.healthSupplements]: "Health Supplements",
  [Category.personalCare]: "Personal Care",
  [Category.babyCare]: "Baby Care",
  [Category.medicalDevices]: "Medical Devices",
};

const ALL_CATEGORIES = Object.values(Category);

interface ProductFormData {
  name: string;
  category: Category;
  description: string;
  price: string;
}

const defaultForm: ProductFormData = {
  name: "",
  category: Category.otcMedicines,
  description: "",
  price: "",
};

const ADMIN_USERNAME = "Babu";
const ADMIN_PASSWORD = "Happy#26";

// ── Local Order types (localStorage) ─────────────────────────────────────
interface LocalOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface LocalOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: LocalOrderItem[];
  totalAmount: number;
  createdAt: number;
  status: "pending" | "processing" | "completed" | "cancelled";
}

function loadOrdersFromLocalStorage(): LocalOrder[] {
  try {
    const raw = localStorage.getItem("vm_orders");
    if (!raw) return [];
    return JSON.parse(raw) as LocalOrder[];
  } catch {
    return [];
  }
}

function saveOrdersToLocalStorage(orders: LocalOrder[]) {
  localStorage.setItem("vm_orders", JSON.stringify(orders));
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: LocalOrder["status"] }) {
  const config: Record<LocalOrder["status"], string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-ui font-medium border capitalize ${config[status] ?? config.pending}`}
    >
      {status}
    </span>
  );
}

export default function AdminPage({ onNavigateHome }: AdminPageProps) {
  const { data: products = [], isLoading: isLoadingProducts } =
    useAllProducts();
  const seedMutation = useSeedSampleProducts();
  const addMutation = useAddProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const toggleStockMutation = useToggleStockStatus();
  const toggleFeaturedMutation = useToggleFeaturedStatus();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<bigint | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultForm);
  const [formErrors, setFormErrors] = useState<Partial<ProductFormData>>({});

  // Orders from localStorage
  const [orders, setOrders] = useState<LocalOrder[]>(() =>
    loadOrdersFromLocalStorage(),
  );

  const handleStatusChange = (
    orderId: string,
    newStatus: LocalOrder["status"],
  ) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o,
    );
    setOrders(updated);
    saveOrdersToLocalStorage(updated);
    toast.success("Order status updated");
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(defaultForm);
    setFormErrors({});
    setShowProductModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price.toString(),
    });
    setFormErrors({});
    setShowProductModal(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<ProductFormData> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    const price = Number.parseFloat(formData.price);
    if (Number.isNaN(price) || price <= 0) errors.price = "Enter a valid price";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const price = Number.parseFloat(formData.price);
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          name: formData.name.trim(),
          category: formData.category,
          description: formData.description.trim(),
          price,
        });
        toast.success("Product updated successfully");
      } else {
        await addMutation.mutateAsync({
          name: formData.name.trim(),
          category: formData.category,
          description: formData.description.trim(),
          price,
        });
        toast.success("Product added successfully");
      }
      setShowProductModal(false);
    } catch {
      toast.error("Failed to save product. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await deleteMutation.mutateAsync(deleteTargetId);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleToggleStock = async (id: bigint) => {
    try {
      await toggleStockMutation.mutateAsync(id);
      toast.success("Stock status updated");
    } catch {
      toast.error("Failed to update stock status");
    }
  };

  const handleToggleFeatured = async (id: bigint) => {
    try {
      await toggleFeaturedMutation.mutateAsync(id);
      toast.success("Featured status updated");
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const handleSeedData = async () => {
    try {
      await seedMutation.mutateAsync();
      toast.success("Sample data seeded successfully");
    } catch {
      toast.error("Failed to seed sample data");
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-xs">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateHome}
              className="font-ui text-muted-foreground hover:text-foreground"
              data-ocid="admin.back.button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-medical-blue" />
              <span className="font-ui font-bold text-foreground">
                Admin Panel
              </span>
            </div>
          </div>
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAuthenticated(false);
                setUsername("");
                setPassword("");
                setLoginError("");
              }}
              className="font-ui text-muted-foreground hover:text-destructive hover:border-destructive"
              data-ocid="admin.logout.button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {/* ── Login Panel ───────────────────────────────────────────────────── */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm mx-auto py-20"
            data-ocid="admin.login.panel"
          >
            <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="inline-flex p-3 bg-blue-50 rounded-xl mb-4">
                  <Shield className="w-8 h-8 text-medical-blue" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Admin Access
                </h2>
                <p className="text-muted-foreground text-sm font-body mt-1 text-center">
                  Enter your credentials to manage the store
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    username === ADMIN_USERNAME &&
                    password === ADMIN_PASSWORD
                  ) {
                    setIsAuthenticated(true);
                    setLoginError("");
                  } else {
                    setLoginError("Invalid username or password");
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <Label
                    htmlFor="admin-username"
                    className="font-ui font-medium mb-1.5 block text-sm"
                  >
                    Username
                  </Label>
                  <Input
                    id="admin-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="Enter username"
                    autoComplete="username"
                    className="font-body"
                    data-ocid="admin.username.input"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="admin-password"
                    className="font-ui font-medium mb-1.5 block text-sm"
                  >
                    Password
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="font-body"
                    data-ocid="admin.password.input"
                  />
                </div>

                {loginError && (
                  <div
                    className="flex items-center gap-2 text-destructive text-sm font-body bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                    data-ocid="admin.login.error_state"
                  >
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    {loginError}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-medical-blue hover:bg-medical-blue-dark text-white font-ui font-semibold mt-2"
                  data-ocid="admin.login.button"
                >
                  Login
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── Admin Panel (authenticated) ───────────────────────────────────── */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Tabs defaultValue="products" className="w-full">
              <TabsList
                className="mb-8 font-ui bg-muted/60 h-12"
                data-ocid="admin.tabs"
              >
                <TabsTrigger
                  value="products"
                  className="font-ui font-medium gap-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  data-ocid="admin.products.tab"
                >
                  <Package className="w-4 h-4" />
                  Product Management
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="font-ui font-medium gap-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  data-ocid="admin.orders.tab"
                >
                  <ClipboardList className="w-4 h-4" />
                  CUSTOMER ORDERS
                  {orders.length > 0 && (
                    <span className="ml-1 min-w-[20px] h-5 rounded-full bg-medical-blue text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {orders.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── Product Management Tab ────────────────────────────────── */}
              <TabsContent value="products">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                      Product Management
                    </h1>
                    <p className="text-muted-foreground text-sm font-body mt-1">
                      Manage your store's product catalog
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSeedData}
                      disabled={seedMutation.isPending}
                      className="font-ui border-border hover:border-medical-blue hover:text-medical-blue"
                      data-ocid="admin.seed_data.button"
                    >
                      {seedMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="w-4 h-4 mr-2" />
                      )}
                      Seed Sample Data
                    </Button>
                    <Button
                      size="sm"
                      className="bg-medical-blue hover:bg-medical-blue-dark text-white font-ui"
                      onClick={openAddModal}
                      data-ocid="admin.add_product.button"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[
                    {
                      label: "Total Products",
                      value: products.length,
                      icon: <Package className="w-5 h-5" />,
                      color: "text-medical-blue",
                    },
                    {
                      label: "In Stock",
                      value: products.filter((p: Product) => p.inStock).length,
                      icon: <CheckCircle className="w-5 h-5" />,
                      color: "text-medical-green",
                    },
                    {
                      label: "Out of Stock",
                      value: products.filter((p: Product) => !p.inStock).length,
                      icon: <XCircle className="w-5 h-5" />,
                      color: "text-destructive",
                    },
                    {
                      label: "Featured",
                      value: products.filter((p: Product) => p.featured).length,
                      icon: <Star className="w-5 h-5" />,
                      color: "text-amber-500",
                    },
                  ].map((stat, idx) => (
                    <div
                      key={stat.label}
                      className="bg-card rounded-xl border border-border p-5 shadow-xs"
                      data-ocid={`admin.stat.${idx + 1}`}
                    >
                      <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                      <div className="font-display text-2xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground font-ui mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Products Table */}
                <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-ui font-semibold text-foreground">
                      All Products
                    </h2>
                  </div>

                  {isLoadingProducts ? (
                    <div
                      className="p-6 space-y-3"
                      data-ocid="admin.products.loading_state"
                    >
                      {(["a", "b", "c", "d", "e"] as const).map((id) => (
                        <Skeleton
                          key={`admin-skeleton-${id}`}
                          className="h-12 w-full rounded"
                        />
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div
                      className="text-center py-16 text-muted-foreground"
                      data-ocid="admin.products.empty_state"
                    >
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-ui font-medium mb-1">
                        No products yet
                      </p>
                      <p className="text-sm">
                        Add products or seed sample data to get started
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table data-ocid="admin.products.table">
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead className="font-ui font-semibold">
                              Name
                            </TableHead>
                            <TableHead className="font-ui font-semibold">
                              Category
                            </TableHead>
                            <TableHead className="font-ui font-semibold">
                              Price
                            </TableHead>
                            <TableHead className="font-ui font-semibold">
                              Stock
                            </TableHead>
                            <TableHead className="font-ui font-semibold">
                              Featured
                            </TableHead>
                            <TableHead className="font-ui font-semibold text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product: Product, idx: number) => (
                            <TableRow
                              key={String(product.id)}
                              className="hover:bg-muted/20 transition-colors"
                              data-ocid={`admin.products.row.${idx + 1}`}
                            >
                              <TableCell className="font-ui font-medium text-foreground max-w-[200px]">
                                <span className="truncate block">
                                  {product.name}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="text-xs font-ui whitespace-nowrap"
                                >
                                  {CATEGORY_LABELS[product.category]}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-ui font-semibold text-medical-blue">
                                ₹{product.price.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {product.inStock ? (
                                  <span className="green-badge text-xs px-2 py-0.5 rounded-full font-ui font-medium">
                                    In Stock
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-ui font-medium bg-red-50 text-red-600 border border-red-200">
                                    Out of Stock
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {product.featured ? (
                                  <span className="blue-badge text-xs px-2 py-0.5 rounded-full font-ui font-medium flex items-center gap-1 w-fit">
                                    <Star className="w-3 h-3" />
                                    Yes
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground font-ui">
                                    No
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      data-ocid={`admin.product.actions.${idx + 1}`}
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48 font-ui"
                                  >
                                    <DropdownMenuItem
                                      onClick={() => openEditModal(product)}
                                      data-ocid={`admin.product.edit.${idx + 1}`}
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleToggleStock(product.id)
                                      }
                                      data-ocid={`admin.product.toggle_stock.${idx + 1}`}
                                    >
                                      {product.inStock ? (
                                        <>
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Mark Out of Stock
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Mark In Stock
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleToggleFeatured(product.id)
                                      }
                                      data-ocid={`admin.product.toggle_featured.${idx + 1}`}
                                    >
                                      <Star className="w-4 h-4 mr-2" />
                                      {product.featured
                                        ? "Remove Featured"
                                        : "Mark Featured"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setDeleteTargetId(product.id)
                                      }
                                      className="text-destructive focus:text-destructive"
                                      data-ocid={`admin.product.delete.${idx + 1}`}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ── CUSTOMER ORDERS Tab ───────────────────────────────────── */}
              <TabsContent value="orders">
                <div className="mb-8">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    Customer Orders
                  </h1>
                  <p className="text-muted-foreground text-sm font-body mt-1">
                    View and manage all orders placed by customers
                  </p>
                </div>

                {/* Orders stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                  {[
                    {
                      label: "Total Orders",
                      value: orders.length,
                      icon: <ClipboardList className="w-5 h-5" />,
                      color: "text-medical-blue",
                    },
                    {
                      label: "Pending",
                      value: orders.filter((o) => o.status === "pending")
                        .length,
                      icon: <ShoppingBag className="w-5 h-5" />,
                      color: "text-amber-600",
                    },
                    {
                      label: "Processing",
                      value: orders.filter((o) => o.status === "processing")
                        .length,
                      icon: <Loader2 className="w-5 h-5" />,
                      color: "text-blue-600",
                    },
                    {
                      label: "Completed",
                      value: orders.filter((o) => o.status === "completed")
                        .length,
                      icon: <CheckCircle className="w-5 h-5" />,
                      color: "text-emerald-600",
                    },
                    {
                      label: "Cancelled",
                      value: orders.filter((o) => o.status === "cancelled")
                        .length,
                      icon: <XCircle className="w-5 h-5" />,
                      color: "text-rose-600",
                    },
                  ].map((stat, idx) => (
                    <div
                      key={stat.label}
                      className="bg-card rounded-xl border border-border p-5 shadow-xs"
                      data-ocid={`admin.orders.stat.${idx + 1}`}
                    >
                      <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                      <div className="font-display text-2xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground font-ui mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Orders Table */}
                <div
                  className="bg-card rounded-xl border border-border shadow-xs overflow-hidden"
                  data-ocid="admin.orders.table"
                >
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-ui font-semibold text-foreground">
                      All Orders
                    </h2>
                  </div>

                  {orders.length === 0 ? (
                    <div
                      className="text-center py-16 text-muted-foreground"
                      data-ocid="admin.orders.empty_state"
                    >
                      <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-ui font-medium mb-1">
                        No customer orders yet
                      </p>
                      <p className="text-sm">
                        Orders placed by customers will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead className="font-ui font-semibold whitespace-nowrap">
                              Order #
                            </TableHead>
                            <TableHead className="font-ui font-semibold whitespace-nowrap">
                              Customer Name
                            </TableHead>
                            <TableHead className="font-ui font-semibold whitespace-nowrap">
                              Phone
                            </TableHead>
                            <TableHead className="font-ui font-semibold whitespace-nowrap">
                              Address
                            </TableHead>
                            <TableHead className="font-ui font-semibold whitespace-nowrap">
                              Items
                            </TableHead>
                            <TableHead className="font-ui font-semibold whitespace-nowrap">
                              Total
                            </TableHead>
                            <TableHead className="font-ui font-semibold whitespace-nowrap">
                              Date & Time
                            </TableHead>
                            <TableHead className="font-ui font-semibold whitespace-nowrap">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order, idx) => {
                            const date = new Date(order.createdAt);
                            const dateStr = date.toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            });
                            const timeStr = date.toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            });
                            return (
                              <TableRow
                                key={order.id}
                                className="hover:bg-muted/20 transition-colors align-top"
                                data-ocid={`admin.orders.row.${idx + 1}`}
                              >
                                <TableCell className="font-ui font-bold text-medical-blue whitespace-nowrap">
                                  #{order.id}
                                </TableCell>
                                <TableCell className="font-ui font-medium text-foreground whitespace-nowrap">
                                  {order.customerName}
                                </TableCell>
                                <TableCell className="text-sm text-foreground/80 whitespace-nowrap font-body">
                                  {order.phone}
                                </TableCell>
                                <TableCell className="text-sm text-foreground/80 font-body max-w-[180px]">
                                  <span className="line-clamp-2">
                                    {order.address}
                                  </span>
                                </TableCell>
                                <TableCell className="font-body min-w-[200px]">
                                  <ul className="space-y-1">
                                    {order.items.map((item, iIdx) => (
                                      <li
                                        key={`${order.id}-${iIdx}`}
                                        className="text-xs text-foreground/80 flex items-start gap-1"
                                      >
                                        <span className="text-medical-blue font-semibold shrink-0">
                                          ×{item.quantity}
                                        </span>
                                        <span className="line-clamp-1">
                                          {item.productName}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </TableCell>
                                <TableCell className="font-display font-bold text-medical-blue whitespace-nowrap">
                                  ₹{order.totalAmount.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-body">
                                  <p>{dateStr}</p>
                                  <p className="text-muted-foreground/70">
                                    {timeStr}
                                  </p>
                                </TableCell>
                                <TableCell className="min-w-[140px]">
                                  <Select
                                    value={order.status}
                                    onValueChange={(val) =>
                                      handleStatusChange(
                                        order.id,
                                        val as LocalOrder["status"],
                                      )
                                    }
                                  >
                                    <SelectTrigger
                                      className="h-8 text-xs font-ui w-[130px] border-border"
                                      data-ocid={`admin.orders.status.select.${idx + 1}`}
                                    >
                                      <SelectValue>
                                        <StatusBadge status={order.status} />
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="font-ui">
                                      <SelectItem value="pending">
                                        <StatusBadge status="pending" />
                                      </SelectItem>
                                      <SelectItem value="processing">
                                        <StatusBadge status="processing" />
                                      </SelectItem>
                                      <SelectItem value="completed">
                                        <StatusBadge status="completed" />
                                      </SelectItem>
                                      <SelectItem value="cancelled">
                                        <StatusBadge status="cancelled" />
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </main>

      {/* ── Add/Edit Product Modal ─────────────────────────────────────────── */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent
          className="sm:max-w-lg font-body"
          data-ocid="admin.product.modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className="font-body text-sm">
              {editingProduct
                ? "Update the product details below."
                : "Fill in the details to add a new product to the catalog."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label
                htmlFor="product-name"
                className="font-ui font-medium mb-1.5 block"
              >
                Product Name *
              </Label>
              <Input
                id="product-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Paracetamol 500mg"
                className={`font-body ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                data-ocid="admin.product.name.input"
              />
              {formErrors.name && (
                <p
                  className="text-destructive text-xs mt-1 font-body"
                  data-ocid="admin.product.name.error_state"
                >
                  {formErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="product-category"
                className="font-ui font-medium mb-1.5 block"
              >
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: val as Category,
                  }))
                }
              >
                <SelectTrigger
                  id="product-category"
                  className="font-body"
                  data-ocid="admin.product.category.select"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="font-body">
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="product-description"
                className="font-ui font-medium mb-1.5 block"
              >
                Description *
              </Label>
              <Textarea
                id="product-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of the product..."
                rows={3}
                className={`font-body resize-none ${formErrors.description ? "border-destructive focus-visible:ring-destructive" : ""}`}
                data-ocid="admin.product.description.textarea"
              />
              {formErrors.description && (
                <p
                  className="text-destructive text-xs mt-1 font-body"
                  data-ocid="admin.product.description.error_state"
                >
                  {formErrors.description}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="product-price"
                className="font-ui font-medium mb-1.5 block"
              >
                Price (₹) *
              </Label>
              <Input
                id="product-price"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0.00"
                className={`font-body ${formErrors.price ? "border-destructive focus-visible:ring-destructive" : ""}`}
                data-ocid="admin.product.price.input"
              />
              {formErrors.price && (
                <p
                  className="text-destructive text-xs mt-1 font-body"
                  data-ocid="admin.product.price.error_state"
                >
                  {formErrors.price}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowProductModal(false)}
              className="font-ui"
              data-ocid="admin.product.modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-medical-blue hover:bg-medical-blue-dark text-white font-ui"
              data-ocid="admin.product.modal.submit_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ────────────────────────────────────────────── */}
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent
          className="font-body"
          data-ocid="admin.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This action cannot be undone. The product will be permanently
              removed from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="font-ui"
              data-ocid="admin.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-ui"
              data-ocid="admin.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
