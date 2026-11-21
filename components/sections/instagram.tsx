"use client";
import Image from "next/image";
import { SwiperSlide } from "swiper/react";
import StoreCarousel from "@/components/ui/store-carousel";
import { Autoplay } from "swiper/modules";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import "swiper/css";

const instagramImages = [
  "/images/footer/instagram/instagram-1.png",
  "/images/footer/instagram/instagram-2.png",
  "/images/footer/instagram/instagram-3.png",
  "/images/footer/instagram/instagram-4.png",
  "/images/footer/instagram/instagram.png",
   "/images/footer/instagram/instagram-1.png",
  "/images/footer/instagram/instagram-2.png",
  "/images/footer/instagram/instagram-3.png",
  "/images/footer/instagram/instagram-4.png",
  "/images/footer/instagram/instagram.png",
];

export default function Instagram() {
  return (
    <section className="relative w-full  pt-16 md:pt-36 pb-5">
      <div className="mx-auto px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="font-['Snell_Roundhand_LT_Std'] text-5xl text-khaki-gold">
            Follow <span className="italic text-olive-slate">us on</span>
          </h2>
          
          {/* Social Icons */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <a 
              href="https://www.facebook.com/share/18CfeyLYXR/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-olive-slate hover:text-neutral-600 transition"
            >
              <FaFacebookF className="text-xl" />
            </a>
            <a 
              href="https://www.instagram.com/lte_bd?igsh=MWRuZGo4bXc1cTl2Zw==" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-olive-slate hover:text-neutral-600 transition"
            >
              <FaInstagram className="text-xl" />
            </a>
            <a 
              href="https://wa.me/8801339879494" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-olive-slate hover:text-neutral-600 transition"
            >
              <FaWhatsapp className="text-xl" />
            </a>
          </div>
        </div>

        {/* Swiper Slider */}
        <StoreCarousel
          modules={[Autoplay]}
          spaceBetween={12}
          slidesPerView={2}
          loop={true}
          speed={1200}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          effect="slide"
          breakpoints={{
            640: {
              slidesPerView: 3,
              spaceBetween: 14,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 16,
            },
            1280: {
              slidesPerView: 6,
              spaceBetween: 18,
            },
          }}
          className="instagram-swiper"
        >
          {instagramImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <Image
                  src={image}
                  alt={`Instagram post ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
              </div>
            </SwiperSlide>
          ))}
        </StoreCarousel>
      </div>
    </section>
  );
}
