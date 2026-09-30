export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'SALES_REP';
  fullName: string;
  firstName?: string;
  lastName?: string;
  associatedRepId?: number | null;
}

export interface Customer {
  customerId: number;
  shopName: string;
  shopAddress: string;
  contactNumber: string;
  shopEmail: string;
  contactPersonName: string;
  repId?: number;
  repName?: string;
}

export interface Item {
  itemId: number;
  brand: string;
  model: string;
  category: string;
  partNumber: string;
  description: string;
  quantity?: number;
}

export interface InventoryStock {
  itemId: number;
  item: Item;
  currentQuantity: number;
  minimumStockLevel: number;
  lastUpdated?: string;
}

export interface Supplier {
  supplierId: number;
  companyName: string;
  companyEmail: string;
  contactNumber: string;
  fax?: string;
  country?: string;
  bankDetails?: string;
  contactPerson?: string;
  contactPersonNumber?: string;
  personEmail?: string;
  supplierItems?: SupplierItem[];
}

export interface SupplierItem {
  supplierItemId: number;
  itemId: number;
  brand?: string;
  model?: string;
  supplierPartNumber: string;
  supplierPrice: number;
  supplyQuantity: number;
}

export interface OrderItem {
  orderItemId?: number;
  itemId: number;
  itemName?: string;
  item?: Item;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice?: number;
}

export interface Order {
  orderId: number;
  invoiceNum: string;
  customer: Customer;
  rep?: any;
  orderedDate: string;
  closingDate?: string;
  totalAmount: number;
  outstandingAmount: number;
  clearanceStatus: boolean;
  orderStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SHIPPED' | 'CANCELLED';
  orderItems: OrderItem[];
}

export interface PriceHistory {
  priceId: number;
  item: Item;
  retailPrice: number;
  importPrice: number;
  salePrice: number;
  startDate: string;
  endDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy?: string;
  approvedBy?: string;
  decisionDate?: string;
}
