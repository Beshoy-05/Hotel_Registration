// src/context/WishlistContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  // 1. حالة لمعرفة المستخدم الحالي
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // 2. دالة لإنشاء مفتاح خاص لكل مستخدم
  // لو فيه يوزر: hotel_wishlist_email@domain.com
  // لو مفيش: hotel_wishlist_guest
  const getStorageKey = (user) => {
    if (user && user.email) {
      return `hotel_wishlist_${user.email}`;
    }
    return "hotel_wishlist_guest";
  };

  const [wishlist, setWishlist] = useState([]);

  // 3. الاستماع لتغيير المستخدم (عند تسجيل الدخول/الخروج)
  useEffect(() => {
    const handleUserChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setCurrentUser(updatedUser);
    };

    // الاستماع للحدث اللي عملناه في SignIn
    window.addEventListener("user-login", handleUserChange);
    
    // كمان نسمع لو الـ Storage اتغير (عشان Logout)
    window.addEventListener("storage", handleUserChange);

    return () => {
      window.removeEventListener("user-login", handleUserChange);
      window.removeEventListener("storage", handleUserChange);
    };
  }, []);

  // 4. تحميل القائمة الخاصة بالمستخدم الحالي فقط
  useEffect(() => {
    const key = getStorageKey(currentUser);
    const saved = localStorage.getItem(key);
    if (saved) {
      setWishlist(JSON.parse(saved));
    } else {
      setWishlist([]); // تصفير القائمة لو مستخدم جديد
    }
  }, [currentUser]); // يشتغل كل ما اليوزر يتغير

  // 5. الحفظ في المفتاح الخاص بالمستخدم الحالي
  useEffect(() => {
    const key = getStorageKey(currentUser);
    localStorage.setItem(key, JSON.stringify(wishlist));
  }, [wishlist, currentUser]);

  // إضافة أو حذف
  const toggleWishlist = (room) => {
    const exists = wishlist.find((r) => r.id === room.id);
    
    if (exists) {
      setWishlist(wishlist.filter((r) => r.id !== room.id));
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      Toast.fire({ icon: 'info', title: 'Removed from favorites' });
    } else {
      setWishlist([...wishlist, room]);
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      Toast.fire({ icon: 'success', title: 'Added to favorites' });
    }
  };

  const isInWishlist = (id) => wishlist.some((r) => r.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);