import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Icon from "@mdi/react";
import {
  mdiSale,
  mdiArrowRightThin,
  mdiStar,
  mdiHeart,
  mdiTrendingUp,
  mdiShieldCheck,
} from "@mdi/js";
import { InteractiveHoverButton } from "../Common/InteractiveHoverButton";
export const HeroBanner = () => {
  return (
    <main className="max-w-full w-full mx-auto">
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#FAFBF8] to-[#FCFCF9]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute h-20 w-20 rounded-full bg-primary/70 top-12 left-[10%]"></div>
          <div className="absolute h-24 w-24 rounded-full bg-secondary/80 top-36 right-[15%]"></div>
          <div className="absolute h-16 w-16 rounded-full bg-primary/40 bottom-10 left-[20%]"></div>
          <div className="absolute h-32 w-32 rounded-full bg-secondary/70 -bottom-10 right-[25%]"></div>
          <div className="absolute h-28 w-28 rounded-full bg-primary/70 -top-10 left-[40%]"></div>
          <div className="absolute h-12 w-12 rounded-full bg-secondary/40 top-1/2 left-[5%]"></div>
          <div className="absolute h-14 w-14 rounded-full bg-primary/80 bottom-1/3 right-[10%]"></div>
          <div className="absolute h-10 w-10 rounded-full bg-secondary/70 top-1/4 right-[30%]"></div>
          <div className="absolute h-36 w-36 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 -bottom-16 left-[30%] blur-sm"></div>
          <div className="absolute h-40 w-40 rounded-full bg-gradient-to-r from-secondary/20 to-primary/20 -top-20 right-[20%] blur-sm"></div>
        </div>
        <div className="absolute top-0 left-1/4 w-56 h-56 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-extra/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-1000"></div>

        <div className="py-20 px-28 relative">
          <img
            src={"/images/banner.jpg"}
            alt="Sneaker - Sneaker mới nhất 2026"
            width={1000}
            height={1000}
            draggable={false}
            loading="eager"
            className="w-full h-auto object-cover select-none absolute top-0 left-0 bottom-0 z-0"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative z-10">
            <div className="order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-50/90 rounded-full text-primary font-medium text-sm border border-green-500"
                >
                  <Icon path={mdiTrendingUp} size={0.8} />
                  <span>Sneaker mới nhất 2026</span>
                </motion.div>

                <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-maintext text-nowrap">
                  <span className="block text-primary uppercase font-extrabold">
                    Sneaker <span className="text-maintext">Sale</span>
                  </span>
                </h2>

                <p className="text-lg text-maintext max-w-4xl">
                  Khám phá sneaker với ưu đãi lên đến 20% cho đơn hàng đầu tiên!
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center border border-secondary/50 w-8 h-8 bg-secondary/10 rounded-full">
                      <Icon
                        path={mdiStar}
                        size={0.8}
                        className="text-primary"
                      />
                    </div>
                    <span className="text-maintext font-medium">
                      Đánh giá 4.8/5 từ hơn 10,000 khách hàng
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center border border-secondary/50 w-8 h-8 bg-extra/10 rounded-full">
                      <Icon
                        path={mdiShieldCheck}
                        size={0.8}
                        className="text-primary"
                      />
                    </div>
                    <span className="text-maintext font-medium">
                      Cam kết chất lượng & bảo hành chính hãng
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex items-center gap-4 p-4 pl-0"
                >
                  <div className="flex -space-x-2">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format"
                      alt="Customer 1"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format"
                      alt="Customer 2"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format"
                      alt="Customer 3"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      loading="lazy"
                    />
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm border-2 border-white">
                      +
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          path={mdiStar}
                          size={0.8}
                          className="text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-base text-gray-600 mt-1 italic">
                      "Laptop chất lượng, giá tốt, hỗ trợ tận tình!"
                    </p>
                  </div>
                </motion.div>

                <div className="pt-4 flex items-center gap-4">
                  <InteractiveHoverButton>
                    Tham gia ngay
                    <Icon path={mdiArrowRightThin} size={0.9} />
                  </InteractiveHoverButton>
                  <Button
                    variant="outline"
                    className="border border-primary text-primary h-10 hover:text-primary/80"
                  >
                    Nhận mã giảm giá
                    <Icon path={mdiSale} size={0.9} />
                  </Button>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="inline-flex items-center gap-2 text-sm text-maintext font-medium"
                >
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                  <span>Ưu đãi có thời hạn - Còn lại 2 ngày!</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HeroBanner;
