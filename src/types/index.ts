export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface PetDetails {
  petName: string;
  info: string;
  age: string;
  chipped: 'yes' | 'no';
  vaccinated: 'yes' | 'no';
  allergies: string;
  medication: string;
  contactNumber: string;
  additionalContact?: string;
  vetNumber?: string;
  productOption: string;
  photo?: string;
}

export interface DeliveryDetails {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface Order {
  id: string;
  orderKey: string;
  petProfileId: string;
  product: Product;
  petDetails: PetDetails;
  deliveryDetails: DeliveryDetails;
  paymentDetails: Omit<PaymentDetails, 'cardNumber' | 'cvv'>;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  total: number;
  qrCodeUrl?: string;
}

export interface User {
  orderKey: string;
  username?: string;
  password?: string;
  orders: Order[];
  isAdmin?: boolean;
}