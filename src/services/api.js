const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};

export const getStoredUser = () => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/register')) {
      clearAuth();
      window.dispatchEvent(new Event('auth-expired'));
    }
    const message = (data && data.error) || (data && data.message) || response.statusText || 'An error occurred';
    throw new Error(message);
  }

  return data;
}

// Authentication
export const apiRegister = (userData) => request('/auth/register', {
  method: 'POST',
  body: JSON.stringify(userData),
});

export const apiLogin = (credentials) => request('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const apiGetMe = () => request('/auth/me');

export const apiLogout = () => {
  clearAuth();
  return request('/auth/logout', { method: 'POST' }).catch(() => {});
};

// Products
export const apiGetProducts = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  const qStr = query.toString();
  return request(`/products${qStr ? `?${qStr}` : ''}`);
};

export const apiGetProduct = (id) => request(`/products/${id}`);

// Cart
export const apiGetCart = () => request('/cart');

export const apiAddToCart = (productId, quantity = 1) => request('/cart/items', {
  method: 'POST',
  body: JSON.stringify({ product_id: productId, quantity }),
});

export const apiUpdateCartItem = (id, quantity) => request(`/cart/items/${id}`, {
  method: 'PUT',
  body: JSON.stringify({ quantity }),
});

export const apiRemoveCartItem = (id) => request(`/cart/items/${id}`, {
  method: 'DELETE',
});

export const apiClearCart = () => request('/cart', {
  method: 'DELETE',
});

export const apiMergeCart = (items) => request('/cart/merge', {
  method: 'POST',
  body: JSON.stringify({ items }),
});

// Orders
export const apiCreateOrder = (orderData) => request('/orders', {
  method: 'POST',
  body: JSON.stringify(orderData),
});

export const apiGetOrders = () => request('/orders');

export const apiGetOrder = (id) => request(`/orders/${id}`);

// Payments
export const apiInitializePayment = (orderId) => request('/payments/initialize', {
  method: 'POST',
  body: JSON.stringify({ order_id: orderId }),
});

export const apiVerifyPayment = (reference) => request(`/payments/verify/${encodeURIComponent(reference)}`);

// Contact
export const apiSubmitContact = (contactData) => request('/contact', {
  method: 'POST',
  body: JSON.stringify(contactData),
});

// Admin
export const apiAdminCreateProduct = (product) => request('/admin/products', {
  method: 'POST',
  body: JSON.stringify(product),
});

export const apiAdminUpdateProduct = (id, product) => request(`/admin/products/${id}`, {
  method: 'PUT',
  body: JSON.stringify(product),
});

export const apiAdminDeleteProduct = (id) => request(`/admin/products/${id}`, {
  method: 'DELETE',
});

export const apiAdminGetOrders = () => request('/admin/orders');

export const apiAdminUpdateOrderStatus = (id, status) => request(`/admin/orders/${id}/status`, {
  method: 'PUT',
  body: JSON.stringify({ status }),
});

export const apiAdminGetContacts = () => request('/admin/contacts');
