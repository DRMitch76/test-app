// src/routes.ts
export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string) => `/product/${id}`,
  CHECKOUT: "/checkout",
  ORDER_CONFIRMATION: "/order-confirmation",
  DASHBOARD: "/dashboard",
  PET_PROFILE: (id: string) => `/pet-profile/${id}`,
  PET_PROFILE_PATH: "/pet-profile/:petProfileId",
};
