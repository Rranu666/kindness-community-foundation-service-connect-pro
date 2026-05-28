/**
 * Centralized order/booking data fetching hooks
 * Used across Dashboard, Orders, OrderTracking, etc.
 */

import { useQuery } from '@tanstack/react-query';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';

/**
 * Fetch all orders for current user
 */
export function useUserOrders(userEmail) {
  return useQuery({
    queryKey: ['user-orders', userEmail],
    queryFn: () => userEmail ? db.Order.filter({ customer_email: userEmail }) : [],
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch a single order
 */
export function useOrder(orderId) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderId ? db.Order.filter({ id: orderId }) : null,
    enabled: !!orderId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch user's addresses
 */
export function useUserAddresses(userEmail) {
  return useQuery({
    queryKey: ['user-addresses', userEmail],
    queryFn: () => userEmail ? db.Address.filter({ customer_email: userEmail }) : [],
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch user's wallet
 */
export function useUserWallet(userEmail) {
  return useQuery({
    queryKey: ['user-wallet', userEmail],
    queryFn: () => userEmail ? db.Wallet.filter({ customer_email: userEmail }) : null,
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch user's transaction history
 */
export function useUserTransactions(userEmail) {
  return useQuery({
    queryKey: ['user-transactions', userEmail],
    queryFn: () => userEmail ? db.Transaction.filter({ customer_email: userEmail }) : [],
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch invoices for user
 */
export function useUserInvoices(userEmail) {
  return useQuery({
    queryKey: ['user-invoices', userEmail],
    queryFn: () => userEmail ? db.Invoice.filter({ customer_email: userEmail }) : [],
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 15,
  });
}

/**
 * Fetch user's favorites
 */
export function useUserFavorites(userEmail) {
  return useQuery({
    queryKey: ['user-favorites', userEmail],
    queryFn: () => userEmail ? db.Favorite.filter({ customer_email: userEmail }) : [],
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 10,
  });
}