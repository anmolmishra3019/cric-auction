import { io } from 'socket.io-client';

export const getUserId = () => {
  let uid = localStorage.getItem('cric_auction_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem('cric_auction_user_id', uid);
  }
  return uid;
};

export const API_BASE = import.meta.env.VITE_API_BASE || (
  import.meta.env.PROD 
    ? window.location.origin 
    : `${window.location.protocol}//${window.location.hostname}:5000`
);

export const socket = io(API_BASE, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    return `₹${cr.endsWith('.00') ? cr.slice(0, -3) : cr} Cr`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2);
    return `₹${lk.endsWith('.00') ? lk.slice(0, -3) : lk} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};