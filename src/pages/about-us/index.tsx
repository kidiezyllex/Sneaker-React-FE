import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "@mdi/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
    mdiCheckCircle,
    mdiShieldCheck,
    mdiStar,
    mdiStore,
    mdiTruck,
    mdiArrowLeft,
} from "@mdi/js";

const FeatureCard = ({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) => (
    <motion.div
        className="group bg-white dark:bg-slate-800 p-8 rounded-3xl transition-all duration-500 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-primary/10"
        whileHover={{ y: -10 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex flex-col items-start gap-4">
            <div className="p-4 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500">
                <Icon path={icon} size={1.5} className="text-primary" />
            </div>
            <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    {description}
                </p>
            </div>
        </div>
    </motion.div>
);

const TestimonialCard = ({
    rating,
    title,
    description,
    image,
    name,
    role,
}: {
    rating: number;
    title: string;
    description: string;
    image: string;
    name: string;
    role: string;
}) => (
    <motion.div
        className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 h-full flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex gap-1 mb-6">
            {[...Array(rating)].map((_, i) => (
                <Icon
                    key={i}
                    path={mdiStar}
                    size={0.8}
                    className="text-amber-400"
                />
            ))}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg leading-relaxed flex-grow italic">
            "{description}"
        </p>
        <div className="flex items-center gap-4 pt-6 border-t border-slate-50 dark:border-slate-700">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 p-0.5">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover rounded-full"
                />
            </div>
            <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-500">{role}</p>
            </div>
        </div>
    </motion.div>
);

const testimonialData = [
    {
        rating: 5,
        title: "Dịch vụ đẳng cấp nhất",
        description: "Tôi chưa từng thấy cửa hàng giày nào có tâm như StreetSneaker. Từ khâu tư vấn đến hậu mãi đều cực kỳ chuyên nghiệp và chu đáo.",
        image: "https://templatekits.themewarrior.com/champz/wp-content/uploads/sites/45/elementor/thumbs/testimo-1-pjspfmypsvn72mv2l3cj4mhf4j0bl9ruu9jw5bh1eo.jpg",
        name: "Tom Robertson",
        role: "Cầu thủ bóng đá chuyên nghiệp",
    },
    {
        rating: 5,
        title: "Sản phẩm cực kỳ chất lượng",
        description: "Cầm đôi giày trên tay là thấy ngay sự khác biệt. Hàng mới, full box, tem mác đầy đủ và check uy tín 100%. Rất xứng đáng đầu tư.",
        image: "https://templatekits.themewarrior.com/champz/wp-content/uploads/sites/45/elementor/thumbs/testimo-2-pjspfoue6jprpusca45s9m0cbar20nzbiiuv3ve928.jpg",
        name: "Amelia Robinson",
        role: "Vận động viên điền kinh",
    },
    {
        rating: 5,
        title: "Đáng tin cậy và minh bạch",
        description: "StreetSneaker luôn làm tôi yên tâm khi mua sắm online. Hình ảnh thực tế, thông tin rõ ràng và chính sách bảo hành cực tốt.",
        image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60",
        name: "Michael Johnson",
        role: "Huấn luyện viên thể hình",
    },
];

const AboutUsPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://templatekits.themewarrior.com/champz/wp-content/uploads/sites/45/2022/01/hero-about.jpg"
                        alt="StreetSneaker Banner"
                        className="w-full h-full object-cover scale-110 motion-safe:animate-[subtle-zoom_20s_infinite_alternate]"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 pb-8">
                    <motion.div
                        className="max-w-4xl mx-auto text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md"
                        >
                            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">
                                Về chúng tôi
                            </span>
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-7xl font-thin text-white mb-8 tracking-wider leading-[0.9]"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            Định nghĩa lại
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                                Phong cách
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 1 }}
                        >
                            StreetSneaker không chỉ bán giày, chúng tôi mang tới những giá trị văn hóa và phong cách sống hiện đại.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        >
                            <Link
                                to="/products"
                                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
                            >
                                <span>Khám phá ngay</span>
                                <Icon path={mdiArrowLeft} size={0.8} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative -mt-16 z-20 pb-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {[
                            { label: "Khách hàng", value: "50k+" },
                            { label: "Chi nhánh", value: "15+" },
                            { label: "Mẫu mã", value: "1200+" },
                            { label: "Đối tác", value: "24+" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-center"
                            >
                                <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em]">
                                    Sứ mệnh
                                </h2>
                                <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter leading-tight">
                                    Kiến tạo phong cách từ nền tảng chất lượng
                                </h3>
                            </div>

                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                StreetSneaker ra đời từ khao khát kết nối những người yêu giày với những sản phẩm tốt nhất. Chúng tôi không chỉ cung cấp giày dép, chúng tôi cung cấp phương tiện để bạn thể hiện bản thân.
                            </p>

                            <div className="space-y-4">
                                {[
                                    "Tuyển chọn gắt gao từng đôi giày từ các thương hiệu lớn.",
                                    "Dịch vụ chăm sóc khách hàng cá nhân hóa độc bản.",
                                    "Cập nhật xu hướng sneaker toàn cầu mỗi ngày.",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="mt-1 p-1 rounded-full bg-primary/10">
                                            <Icon path={mdiCheckCircle} size={0.6} className="text-primary" />
                                        </div>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative group"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-emerald-400/30 blur-2xl rounded-[3rem] opacity-50 group-hover:opacity-100 transition duration-700"></div>
                            <div className="relative aspect-square md:aspect-[4/5] rounded-[2.5rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl">
                                <img
                                    src="https://templatekits.themewarrior.com/champz/wp-content/uploads/sites/45/elementor/thumbs/about-sect-pjs7cmwyucho7hy38akr4ok276qbcwtfp44ksgi1sa.jpg"
                                    alt="StreetSneaker Store"
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-20 space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em]">
                            Giá trị cốt lõi
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">
                            Tại sao chọn chúng tôi?
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Mỗi đôi giày tại StreetSneaker đều mang trong mình sự tận tâm và cam kết tuyệt đối về trải nghiệm người dùng.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        <FeatureCard
                            icon={mdiCheckCircle}
                            title="Chính hãng 100%"
                            description="Tuyệt đối nói không với hàng giả, hàng nhái. Mỗi sản phẩm đều đầy đủ giấy tờ."
                        />
                        <FeatureCard
                            icon={mdiTruck}
                            title="Giao hỏa tốc"
                            description="Hợp tác với các đơn vị vận chuyển hàng đầu, đảm bảo giày đến tay bạn nhanh nhất."
                        />
                        <FeatureCard
                            icon={mdiShieldCheck}
                            title="Bảo hành trọn đời"
                            description="Dịch vụ bảo hành keo chỉ trọn đời cho tất cả các sản phẩm mua tại cửa hàng."
                        />
                        <FeatureCard
                            icon={mdiStore}
                            title="Trải nghiệm Offline"
                            description="Hệ thống cửa hàng hiện đại tại các trung tâm lớn để khách hàng trải nghiệm thực tế."
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-primary overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-400/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        className="text-center mb-20 space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.3em]">
                            Đánh giá
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
                            Cảm nhận khách hàng
                        </h3>
                    </motion.div>

                    <Swiper
                        modules={[Pagination, Autoplay, Navigation]}
                        spaceBetween={30}
                        slidesPerView={1}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        autoplay={{ delay: 5000 }}
                        loop={true}
                        breakpoints={{
                            768: { slidesPerView: 2, spaceBetween: 24 },
                            1024: { slidesPerView: 3, spaceBetween: 32 },
                        }}
                        className="testimonial-swiper !pb-16"
                    >
                        {testimonialData.map((testimonial, index) => (
                            <SwiperSlide key={index} className="h-auto">
                                <TestimonialCard
                                    rating={testimonial.rating}
                                    title={testimonial.title}
                                    description={testimonial.description}
                                    image={testimonial.image}
                                    name={testimonial.name}
                                    role={testimonial.role}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
        </div>
    );
};

export default AboutUsPage;