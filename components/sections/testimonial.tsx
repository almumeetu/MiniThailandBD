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
      author: "Shahriar Khan Abir",
      role: "Service Holder",
      rating: 5,
      text: "I don't like ghee, but my father really loves it. So I bought some ghee for him. He said this ghee is the best he has ever had.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      author: "Fariha Akter Tumpa",
      role: "Entrepreneur",
      rating: 5,
      text: "In a market full of doubts, this has become our most trustworthy store for genuine quality and pure daily essentials.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      author: "Ayesha Khan",
      role: "Banker",
      rating: 5,
      text: "Ordered for the second time! Just like my first purchase, the quality is top-notch and delivery was super fast. Completely satisfied.",
      avatar: null,
    },
    {
      id: 4,
      author: "Tanvir Ahmed",
      role: "Corporate Executive",
      rating: 5,
      text: "Ordered raw organic honey and cold-pressed mustard oil. Everything arrived fresh, properly packed, and 100% authentic. Truly reliable service.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: 5,
      author: "Nusrat Jahan",
      role: "Doctor",
      rating: 5,
      text: "I used to be hesitant ordering groceries online, but their product purity and prompt customer support are unmatched. Excellent experience!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: 6,
      author: "Mahmudul Hasan",
      role: "University Lecturer",
      rating: 5,
      text: "The premium dates and organic ghee are top-notch quality. Courteous delivery staff and fast doorstep delivery. Highly recommended!",
      avatar: null,
    },
  ];

  return (
    <section className="w-full py-14 sm:py-16 lg:py-20 bg-[#FAF8F5] border-t border-zinc-200/70 overflow-hidden font-sans">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        {/* Section Header with orange-bordered indicator */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <h2 className="text-zinc-900 text-2xl sm:text-3xl font-bold tracking-tight">
            What Our Customers Say
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
                "inline-block w-2.5 h-2.5 rounded-full border-2 border-orange-500 bg-transparent cursor-pointer transition-all duration-300 mx-1",
              bulletActiveClass: "!bg-orange-500 !w-2.5 !h-2.5",
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
