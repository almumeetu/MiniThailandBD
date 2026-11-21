'use client';

import { SwiperSlide } from 'swiper/react';
import StoreCarousel from "@/components/ui/store-carousel";
import { Autoplay } from 'swiper/modules';
import { useNotificationSettings } from "@/lib/notification-store";
import data from "@/data/top-header.json";
import 'swiper/css';

export default function TopSlider() {
  const notificationSettings = useNotificationSettings();
  const slides = notificationSettings?.slides?.length > 0 
    ? notificationSettings.slides 
    : data.slider.slides;

  const autoplayDelay = notificationSettings?.autoplayDelay || data.slider.autoplayDelay || 3500;
  const speed = notificationSettings?.speed || data.slider.speed || 600;

  if (notificationSettings && !notificationSettings.enabled) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 text-[#94A3B8] w-full justify-center">
      <div className="flex-grow overflow-hidden px-0.5 sm:px-1">
        <StoreCarousel
          compactPlayback
          modules={[Autoplay]}
          autoplay={{
            delay: autoplayDelay,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={speed}
          className="topslider-swiper"
        >
          {slides.map((text: string, index: number) => (
            <SwiperSlide key={index}>
              <div className="text-center truncate">
                <span className="text-[#cbd5e1] text-[11px] sm:text-xs font-normal tracking-wide">
                  {text}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </StoreCarousel>
      </div>
    </div>
  );
}
