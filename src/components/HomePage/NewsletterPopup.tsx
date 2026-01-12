import React, { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@mdi/react";
import { Button } from "@/components/ui/button";

export const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenNewsletterPopup");

    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenNewsletterPopup", "true");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      handleClose();
      setTimeout(() => setSuccess(false), 500);
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-4xl w-full bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              className="absolute top-3 right-3 z-10 text-maintext hover:text-maintext"
              onClick={handleClose}
            >
              <Icon path={mdiClose} size={0.8} />
            </button>

            <div className="grid md:grid-cols-5">
              {/* Phần màu */}
              <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-primary to-extra">
                <div className="h-full flex items-center justify-center p-4">
                  <Icon
                    path={mdiGiftOutline}
                    size={4}
                    className="text-white/80"
                  />
                </div>
              </div>

              {/* Phần nội dung */}
              <div className="p-4 md:p-8 md:col-span-3">
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-semibold text-maintext mb-2">
                    Nhận ngay ưu đãi 20%
                  </h3>
                  <p className="text-maintext mb-4">
                    Đăng ký nhận thông tin để không bỏ lỡ các ưu đãi đặc biệt và
                    sản phẩm mới nhất từ AllwearStudio.
                  </p>

                  {success ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-green-50 text-green-700 px-4 py-3 rounded text-center"
                    >
                      Cảm ơn bạn đã đăng ký! Mã giảm giá sẽ được gửi đến email
                      của bạn.
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <Input
                          type="email"
                          placeholder="Email của bạn"
                          className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <Button type="submit" className="w-full">
                          Đăng ký nhận ưu đãi
                        </Button>
                      </div>
                    </form>
                  )}

                  <p className="text-sm text-maintext mt-4">
                    Chúng tôi cam kết bảo mật thông tin của bạn. Bằng cách đăng
                    ký, bạn đồng ý với Chính sách bảo mật của chúng tôi.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewsletterPopup;
