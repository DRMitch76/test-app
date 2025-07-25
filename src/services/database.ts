import { supabase } from "../lib/supabase";
import { Product, Order, User, PetDetails, DeliveryDetails } from "../types";

// Products
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    image: product.image,
    category: product.category,
  }));
};

export const addProduct = async (
  product: Omit<Product, "id">,
): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding product:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    image: data.image,
    category: data.category,
  };
};

export const updateProduct = async (product: Product): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .update({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      updated_at: new Date().toISOString(),
    })
    .eq("id", product.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    image: data.image,
    category: data.category,
  };
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      products (*)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }

  return data.map((order) => ({
    id: order.id,
    orderKey: order.order_key,
    petProfileId: order.pet_profile_id,
    product: {
      id: order.products.id,
      name: order.products.name,
      description: order.products.description,
      price: parseFloat(order.products.price),
      image: order.products.image,
      category: order.products.category,
    },
    petDetails: {
      petName: order.pet_name,
      info: order.pet_info || "",
      age: order.pet_age,
      chipped: order.pet_chipped as "yes" | "no",
      vaccinated: order.pet_vaccinated as "yes" | "no",
      allergies: order.pet_allergies || "",
      medication: order.pet_medication || "",
      contactNumber: order.contact_number,
      additionalContact: order.additional_contact || "",
      vetNumber: order.vet_number || "",
      productOption: order.product_option,
      photo: order.pet_photo || "",
    },
    deliveryDetails: {
      fullName: order.delivery_full_name,
      address: order.delivery_address,
      city: order.delivery_city,
      postalCode: order.delivery_postal_code,
      phone: order.delivery_phone,
    },
    paymentDetails: {
      cardholderName: order.payment_cardholder_name,
      expiryDate: order.payment_expiry_date,
    },
    status: order.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
    createdAt: order.created_at,
    total: parseFloat(order.total),
    qrCodeUrl: order.qr_code_url,
  }));
};

export const getOrderByPetProfileId = async (
  petProfileId: string,
): Promise<Order | null> => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      products (*)
    `,
    )
    .eq("pet_profile_id", petProfileId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No rows found
    }
    console.error("Error fetching order by pet profile ID:", error);
    throw error;
  }

  return {
    id: data.id,
    orderKey: data.order_key,
    petProfileId: data.pet_profile_id,
    product: {
      id: data.products.id,
      name: data.products.name,
      description: data.products.description,
      price: parseFloat(data.products.price),
      image: data.products.image,
      category: data.products.category,
    },
    petDetails: {
      petName: data.pet_name,
      info: data.pet_info || "",
      age: data.pet_age,
      chipped: data.pet_chipped as "yes" | "no",
      vaccinated: data.pet_vaccinated as "yes" | "no",
      allergies: data.pet_allergies || "",
      medication: data.pet_medication || "",
      contactNumber: data.contact_number,
      additionalContact: data.additional_contact || "",
      vetNumber: data.vet_number || "",
      productOption: data.product_option,
      photo: data.pet_photo || "",
    },
    deliveryDetails: {
      fullName: data.delivery_full_name,
      address: data.delivery_address,
      city: data.delivery_city,
      postalCode: data.delivery_postal_code,
      phone: data.delivery_phone,
    },
    paymentDetails: {
      cardholderName: data.payment_cardholder_name,
      expiryDate: data.payment_expiry_date,
    },
    status: data.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
    createdAt: data.created_at,
    total: parseFloat(data.total),
    qrCodeUrl: data.qr_code_url,
  };
};

export const addOrder = async (
  order: Omit<Order, "id" | "createdAt">,
): Promise<Order> => {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_key: order.orderKey,
      pet_profile_id: order.petProfileId,
      product_id: order.product.id,
      pet_name: order.petDetails.petName,
      pet_info: order.petDetails.info,
      pet_age: order.petDetails.age,
      pet_chipped: order.petDetails.chipped,
      pet_vaccinated: order.petDetails.vaccinated,
      contact_number: order.petDetails.contactNumber,
      additional_contact: order.petDetails.additionalContact,
      vet_number: order.petDetails.vetNumber,
      product_option: order.petDetails.productOption,
      delivery_full_name: order.deliveryDetails.fullName,
      delivery_address: order.deliveryDetails.address,
      delivery_city: order.deliveryDetails.city,
      delivery_postal_code: order.deliveryDetails.postalCode,
      delivery_phone: order.deliveryDetails.phone,
      payment_cardholder_name: order.paymentDetails.cardholderName,
      payment_expiry_date: order.paymentDetails.expiryDate,
      status: order.status,
      total: order.total,
      qr_code_url: order.qrCodeUrl,
    })
    .select(
      `
      *,
      products (*)
    `,
    )
    .single();

  if (error) {
    console.error("Error adding order:", error);
    throw error;
  }

  return {
    id: data.id,
    orderKey: data.order_key,
    petProfileId: data.pet_profile_id,
    product: {
      id: data.products.id,
      name: data.products.name,
      description: data.products.description,
      price: parseFloat(data.products.price),
      image: data.products.image,
      category: data.products.category,
    },
    petDetails: {
      petName: data.pet_name,
      info: data.pet_info || "",
      age: data.pet_age,
      chipped: data.pet_chipped as "yes" | "no",
      vaccinated: data.pet_vaccinated as "yes" | "no",
      allergies: data.pet_allergies || "",
      medication: data.pet_medication || "",
      contactNumber: data.contact_number,
      additionalContact: data.additional_contact || "",
      vetNumber: data.vet_number || "",
      productOption: data.product_option,
      photo: data.pet_photo || "",
    },
    deliveryDetails: {
      fullName: data.delivery_full_name,
      address: data.delivery_address,
      city: data.delivery_city,
      postalCode: data.delivery_postal_code,
      phone: data.delivery_phone,
    },
    paymentDetails: {
      cardholderName: data.payment_cardholder_name,
      expiryDate: data.payment_expiry_date,
    },
    status: data.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
    createdAt: data.created_at,
    total: parseFloat(data.total),
    qrCodeUrl: data.qr_code_url,
  };
};

export const updateOrder = async (order: Order): Promise<Order> => {
  const { data, error } = await supabase
    .from("orders")
    .update({
      pet_name: order.petDetails.petName,
      pet_info: order.petDetails.info,
      pet_age: order.petDetails.age,
      pet_chipped: order.petDetails.chipped,
      pet_vaccinated: order.petDetails.vaccinated,
      contact_number: order.petDetails.contactNumber,
      additional_contact: order.petDetails.additionalContact,
      vet_number: order.petDetails.vetNumber,
      product_option: order.petDetails.productOption,
      delivery_full_name: order.deliveryDetails.fullName,
      delivery_address: order.deliveryDetails.address,
      delivery_city: order.deliveryDetails.city,
      delivery_postal_code: order.deliveryDetails.postalCode,
      delivery_phone: order.deliveryDetails.phone,
      status: order.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .select(
      `
      *,
      products (*)
    `,
    )
    .single();

  if (error) {
    console.error("Error updating order:", error);
    throw error;
  }

  return {
    id: data.id,
    orderKey: data.order_key,
    petProfileId: data.pet_profile_id,
    product: {
      id: data.products.id,
      name: data.products.name,
      description: data.products.description,
      price: parseFloat(data.products.price),
      image: data.products.image,
      category: data.products.category,
    },
    petDetails: {
      petName: data.pet_name,
      info: data.pet_info || "",
      age: data.pet_age,
      chipped: data.pet_chipped as "yes" | "no",
      vaccinated: data.pet_vaccinated as "yes" | "no",
      allergies: data.pet_allergies || "",
      medication: data.pet_medication || "",
      contactNumber: data.contact_number,
      additionalContact: data.additional_contact || "",
      vetNumber: data.vet_number || "",
      productOption: data.product_option,
      photo: data.pet_photo || "",
    },
    deliveryDetails: {
      fullName: data.delivery_full_name,
      address: data.delivery_address,
      city: data.delivery_city,
      postalCode: data.delivery_postal_code,
      phone: data.delivery_phone,
    },
    paymentDetails: {
      cardholderName: data.payment_cardholder_name,
      expiryDate: data.payment_expiry_date,
    },
    status: data.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
    createdAt: data.created_at,
    total: parseFloat(data.total),
    qrCodeUrl: data.qr_code_url,
  };
};

export const updateOrderStatus = async (orderId: string, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"): Promise<void> => {
  const { error } = await supabase
    .from("orders")
    .update({
      status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Users
export const getUserByOrderKey = async (
  orderKey: string,
): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("order_key", orderKey)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No rows found
    }
    console.error("Error fetching user by order key:", error);
    throw error;
  }

  // Get user's orders
  const orders = await getOrdersByOrderKey(orderKey);

  return {
    orderKey: data.order_key,
    username: data.username,
    password: "", // Don't return password
    orders,
    isAdmin: data.is_admin,
  };
};

export const getOrdersByOrderKey = async (
  orderKey: string,
): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      products (*)
    `,
    )
    .eq("order_key", orderKey)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders by order key:", error);
    throw error;
  }

  return data.map((order) => ({
    id: order.id,
    orderKey: order.order_key,
    petProfileId: order.pet_profile_id,
    product: {
      id: order.products.id,
      name: order.products.name,
      description: order.products.description,
      price: parseFloat(order.products.price),
      image: order.products.image,
      category: order.products.category,
    },
    petDetails: {
      petName: order.pet_name,
      info: order.pet_info || "",
      age: order.pet_age,
      chipped: order.pet_chipped as "yes" | "no",
      vaccinated: order.pet_vaccinated as "yes" | "no",
      allergies: order.pet_allergies || "",
      medication: order.pet_medication || "",
      contactNumber: order.contact_number,
      additionalContact: order.additional_contact || "",
      vetNumber: order.vet_number || "",
      productOption: order.product_option,
      photo: order.pet_photo || "",
    },
    deliveryDetails: {
      fullName: order.delivery_full_name,
      address: order.delivery_address,
      city: order.delivery_city,
      postalCode: order.delivery_postal_code,
      phone: order.delivery_phone,
    },
    paymentDetails: {
      cardholderName: order.payment_cardholder_name,
      expiryDate: order.payment_expiry_date,
    },
    status: order.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
    createdAt: order.created_at,
    total: parseFloat(order.total),
    qrCodeUrl: order.qr_code_url,
  }));
};

export const createUser = async (
  orderKey: string,
  username?: string,
  passwordHash?: string,
): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .insert({
      order_key: orderKey,
      username,
      password_hash: passwordHash,
      is_admin: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    throw error;
  }

  const orders = await getOrdersByOrderKey(orderKey);

  return {
    orderKey: data.order_key,
    username: data.username,
    password: "", // Don't return password
    orders,
    isAdmin: data.is_admin,
  };
};

export const updateUserCredentials = async (
  orderKey: string,
  username: string,
  passwordHash: string,
): Promise<void> => {
  const { error } = await supabase
    .from("users")
    .update({
      username,
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq("order_key", orderKey);

  if (error) {
    console.error("Error updating user credentials:", error);
    throw error;
  }
};