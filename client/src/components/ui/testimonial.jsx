import React, { useRef } from "react";
import { TimelineContent } from "./timeline-animation";

function ClientFeedback() {
  const testimonialRef = useRef(null);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <main className="w-full bg-bgLight py-16">
      <section 
        className="relative h-full max-w-6xl text-black mx-auto py-14 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm" 
        ref={testimonialRef}
      >
        {/* Title */}
        <article className="max-w-screen-md mx-auto text-center space-y-3 mb-12 flex flex-col items-center justify-center">
          <TimelineContent 
            as="h2" 
            className="text-3xl md:text-4xl font-extrabold tracking-tight m-0 text-center w-full" 
            style={{ color: 'var(--color-textCharcoal)', textAlign: 'center' }}
            animationNum={0} 
            customVariants={revealVariants} 
            timelineRef={testimonialRef}
          >
            Trusted by Startups and the world's largest companies
          </TimelineContent>
          <TimelineContent 
            as="p" 
            className="mx-auto text-gray-500 text-sm md:text-base max-w-md leading-relaxed m-0 text-center w-full" 
            style={{ color: '#6B7280', textAlign: 'center' }}
            animationNum={1} 
            customVariants={revealVariants} 
            timelineRef={testimonialRef}
          >
            Let's hear how our clients feel about our service
          </TimelineContent>
        </article>

        {/* 3-Column Masonry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full py-4 px-2">
          
          {/* Column 1: Tall White Grid Card (top) + Short Blue Card (bottom) */}
          <div className="flex flex-col gap-6 lg:h-[660px]">
            {/* Card A: White Grid Card */}
            <TimelineContent 
              animationNum={0} 
              customVariants={revealVariants} 
              timelineRef={testimonialRef} 
              className="flex-[7] flex flex-col justify-between relative bg-white overflow-hidden rounded-[24px] border border-gray-200 p-6 pt-0 text-left"
            >
              {/* Absolute Grid overlay at top of the card */}
              <div className="absolute top-0 left-0 right-0 h-36 border-b border-gray-100 bg-white pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:12.5%_33.33%]" />
              </div>

              {/* Spacer to push content below absolute grid */}
              <div className="h-36 w-full mb-6 flex-shrink-0" />

              <p className="text-gray-700 text-[14px] leading-relaxed font-medium mb-6 relative z-10">
                "Hypersphere has been a game-changer for us. Their service is
                top-notch and their team is incredibly responsive."
              </p>

              <div className="flex justify-between items-center mt-auto relative z-10">
                <div className="text-left">
                  <h3 className="font-bold text-gray-900 text-base m-0">
                    Guillermo Rauch
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold m-0 mt-1">CEO of Enigma</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop"
                  alt="Guillermo Rauch"
                  className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100"
                />
              </div>
            </TimelineContent>

            {/* Card B: Blue Card */}
            <TimelineContent 
              animationNum={1} 
              customVariants={revealVariants} 
              timelineRef={testimonialRef} 
              className="flex-[3] flex flex-col justify-between relative bg-[#1a5cff] text-white overflow-hidden rounded-2xl p-6 text-left"
            >
              <p className="text-white text-[14px] leading-relaxed font-medium mb-6">
                "We've seen incredible results with Hypersphere. Their
                expertise, dedication."
              </p>
              <div className="flex justify-between items-center mt-auto">
                <div className="text-left">
                  <h3 className="font-bold text-base m-0">Rika Shinoda</h3>
                  <p className="text-xs text-blue-200 font-semibold m-0 mt-1">CEO of Kintsugi</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?q=80&w=150&auto=format&fit=crop"
                  alt="Rika Shinoda"
                  className="w-12 h-12 rounded-xl object-cover shadow-sm border border-blue-400"
                />
              </div>
            </TimelineContent>
          </div>

          {/* Column 2: Three Uniform Black Cards */}
          <div className="flex flex-col gap-6 lg:h-[660px]">
            {/* Card C */}
            <TimelineContent 
              animationNum={2} 
              customVariants={revealVariants} 
              timelineRef={testimonialRef} 
              className="flex-1 flex flex-col justify-between relative bg-[#111111] text-white overflow-hidden rounded-2xl p-6 text-left"
            >
              <p className="text-gray-300 text-[14px] leading-relaxed font-medium mb-6">
                "Their team is highly professional, and their innovative
                solutions have truly transformed the way we operate."
              </p>
              <div className="flex justify-between items-center mt-auto">
                <div className="text-left">
                  <h3 className="font-bold text-base m-0">Reacher</h3>
                  <p className="text-xs text-gray-400 font-semibold m-0 mt-1">CEO of OdeaoLabs</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=150&auto=format&fit=crop"
                  alt="Reacher"
                  className="w-12 h-12 rounded-xl object-cover shadow-sm border border-zinc-800"
                />
              </div>
            </TimelineContent>

            {/* Card D */}
            <TimelineContent 
              animationNum={3} 
              customVariants={revealVariants} 
              timelineRef={testimonialRef} 
              className="flex-1 flex flex-col justify-between relative bg-[#111111] text-white overflow-hidden rounded-2xl p-6 text-left"
            >
              <p className="text-gray-300 text-[14px] leading-relaxed font-medium mb-6">
                "We're extremely satisfied with Hypersphere. Their expertise
                and dedication have exceeded our expectations."
              </p>
              <div className="flex justify-between items-center mt-auto">
                <div className="text-left">
                  <h3 className="font-bold text-base m-0">John</h3>
                  <p className="text-xs text-gray-400 font-semibold m-0 mt-1">CEO of Labsbo</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=150&auto=format&fit=crop"
                  alt="John"
                  className="w-12 h-12 rounded-xl object-cover shadow-sm border border-zinc-800"
                />
              </div>
            </TimelineContent>

            {/* Card E */}
            <TimelineContent 
              animationNum={4} 
              customVariants={revealVariants} 
              timelineRef={testimonialRef} 
              className="flex-1 flex flex-col justify-between relative bg-[#111111] text-white overflow-hidden rounded-2xl p-6 text-left"
            >
              <p className="text-gray-300 text-[14px] leading-relaxed font-medium mb-6">
                "Their customer support is absolutely exceptional. They are
                always available, incredibly helpful."
              </p>
              <div className="flex justify-between items-center mt-auto">
                <div className="text-left">
                  <h3 className="font-bold text-base m-0">Steven Sunny</h3>
                  <p className="text-xs text-gray-400 font-semibold m-0 mt-1">CEO of boxefi</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
                  alt="Steven Sunny"
                  className="w-12 h-12 rounded-xl object-cover shadow-sm border border-zinc-800"
                />
              </div>
            </TimelineContent>
          </div>

          {/* Column 3: Short Blue Card (top) + Tall White Grid Card (bottom) */}
          <div className="flex flex-col gap-6 lg:h-[660px]">
            {/* Card F: Blue Card */}
            <TimelineContent 
              animationNum={5} 
              customVariants={revealVariants} 
              timelineRef={testimonialRef} 
              className="flex-[3] flex flex-col justify-between relative bg-[#1a5cff] text-white overflow-hidden rounded-2xl p-6 text-left"
            >
              <p className="text-white text-[14px] leading-relaxed font-medium mb-6">
                "Hypersphere has been a key partner in our growth journey."
              </p>
              <div className="flex justify-between items-center mt-auto">
                <div className="text-left">
                  <h3 className="font-bold text-base m-0">Guillermo Rauch</h3>
                  <p className="text-xs text-blue-200 font-semibold m-0 mt-1">CEO of OdeaoLabs</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1563237023-b1e970526dcb?q=80&w=150&auto=format&fit=crop"
                  alt="Guillermo Rauch"
                  className="w-12 h-12 rounded-xl object-cover shadow-sm border border-blue-400"
                />
              </div>
            </TimelineContent>

            {/* Card G: White Grid Card */}
            <TimelineContent 
              animationNum={6} 
              customVariants={revealVariants} 
              timelineRef={testimonialRef} 
              className="flex-[7] flex flex-col justify-between relative bg-white overflow-hidden rounded-[24px] border border-gray-200 p-6 pt-0 text-left"
            >
              {/* Absolute Grid overlay at top of the card */}
              <div className="absolute top-0 left-0 right-0 h-36 border-b border-gray-100 bg-white pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:12.5%_33.33%]" />
              </div>

              {/* Spacer to push content below absolute grid */}
              <div className="h-36 w-full mb-6 flex-shrink-0" />

              <p className="text-gray-700 text-[14px] leading-relaxed font-medium mb-6 relative z-10">
                "Hypersphere has been a true game-changer for us. Their
                exceptional service, combined with their deep expertise and
                commitment to excellence, has made a significant impact on our
                business."
              </p>

              <div className="flex justify-between items-center mt-auto relative z-10">
                <div className="text-left">
                  <h3 className="font-bold text-gray-900 text-base m-0">
                    Paul Brauch
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold m-0 mt-1">CTO of Spectrum</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1590086782957-93c06ef21604?q=80&w=150&auto=format&fit=crop"
                  alt="Paul Brauch"
                  className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100"
                />
              </div>
            </TimelineContent>
          </div>

        </div>

        {/* Bottom Decorative Line Wrapper */}
        <div className="absolute border-b border-gray-200 bottom-4 h-16 z-[2] md:w-[94%] w-[90%] md:left-[3%] left-[5%]">
          <div className="container mx-auto w-full h-full relative before:absolute before:-left-2 before:-bottom-1.5 before:w-3 before:h-3 before:bg-white before:rounded-full before:border before:border-gray-200 after:absolute after:-right-2 after:-bottom-1.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:border after:border-gray-200"></div>
        </div>
      </section>
    </main>
  );
}

export default ClientFeedback;
