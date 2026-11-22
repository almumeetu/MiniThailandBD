"use client";

import Image from "next/image";
import { SwiperSlide } from "swiper/react";
import StoreCarousel from "@/components/ui/store-carousel";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { IoStar } from "react-icons/io5";
import { HiUser } from "react-icons/hi2";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Testimonial() {
  const testimonials = [
    {
      id: 1,
      author: "Tanjina Akter",
      role: "Verified Buyer • Dhanmondi",
      rating: 5,
      text: "Alhamdulillah parcel peyechi! Dress ta truly oshadharon! Fabric er quality eto soft ar comfortable, shotti bolar moto na! Picture thekeo real e onek beshi gorgeous lagche. Thank you Mini Thailand for authentic Bangkok quality!",
      avatar: "/images/testiminial/testimonial-1.png",
    },
    {
      id: 2,
      author: "Sadia Islam Mim",
      role: "Verified Buyer • Chattogram",
      rating: 5,
      text: "My sister's wedding party outfit arrived right on time! The crimson lace party gown fits absolutely like a dream, and everyone at the event kept asking where I bought it from. 2 days delivery to Ctg was remarkably fast!",
      avatar: "/images/testiminial/testimonial-2.png",
    },
    {
      id: 3,
      author: "Nusrat Jahan Chowdhury",
      role: "Verified Buyer • Sylhet",
      rating: 5,
      text: "Normally online e dress kinte voy pay, kintu video call e pura dress live dekhiye parcel pathiyechen tai trust kore order korechilam. Dress er stitching, finish ar packaging 100 out of 100! Will definitely order more.",
      avatar: "/images/testiminial/testimonial-3.png",
    },
    {
      id: 4,
      author: "Mehnaz Rahman",
      role: "Verified Buyer • Uttara",
      rating: 5,
      text: "Received the rose pink lace outfit today! Perfect fitting and fabric weight is just right for festive occasions. Truly authentic imported piece with superb packaging. Mini Thailand BD has earned a loyal customer!",
      avatar: "/images/testiminial/testimonial-4.png",
    },
  ];

  return (
    <section className="w-full py-14 sm:py-16 lg:py-20 bg-[#FAF8F5] border-t border-zinc-200/70 overflow-hidden font-sans">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        {/* Section Header matching site typography */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <span className="text-xs sm:text-[13px] font-semibold tracking-[0.22em] text-[#ec1c67] uppercase mb-2">
            WHAT OUR CLIENTS
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-[0.20em] text-zinc-950 uppercase font-sans">
            SAY ABOUT US
          </h2>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <StoreCarousel
            modules={[Navigation, Pagination, Autoplay]}
            pagination={{
              clickable: true,
              el: ".custom-testimonial-pagination",
              bulletClass:
                "inline-block w-2.5 h-2.5 rounded-full border-2 border-[#ec1c67] bg-transparent cursor-pointer transition-all duration-300 mx-1",
              bulletActiveClass: "!bg-[#ec1c67] !w-2.5 !h-2.5",
            }}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            speed={600}
            loop={true}
            className="pb-2"
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <div className="bg-white rounded-[3px] border border-zinc-200/90 p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-full min-h-[220px] sm:min-h-[235px]">
                  {/* Review Text at Top */}
                  <div>
                    <p className="text-zinc-700 text-sm sm:text-[14px] leading-relaxed font-normal min-h-[4rem] line-clamp-3">
                      {item.text}
                    </p>
                  </div>

                  {/* Rating & Author at Bottom */}
                  <div className="mt-5">
                    {/* 5 Yellow Stars in Middle */}
                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                      {[...Array(item.rating)].map((_, i) => (
                        <IoStar key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Author Row */}
                    <div className="flex items-center gap-3 pt-3.5 border-t border-zinc-100">
                      {item.avatar ? (
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                          <Image
                            src={item.avatar}
                            alt={item.author}
                            width={44}
                            height={44}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-zinc-200/80 shrink-0 flex items-center justify-center text-zinc-500">
                          <HiUser className="w-6 h-6 text-zinc-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-semibold text-zinc-900 text-sm leading-tight truncate">
                          {item.author}
                        </h4>
                        <p className="text-xs text-zinc-500 font-normal mt-0.5">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </StoreCarousel>
        </div>

        {/* Pagination Dots (Matching reference image: 3 orange dots) */}
        <div className="custom-testimonial-pagination flex justify-center items-center gap-1 mt-7 sm:mt-8"></div>
      </div>
    </section>
  );
}
