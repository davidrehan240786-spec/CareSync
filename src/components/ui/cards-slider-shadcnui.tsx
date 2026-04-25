
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import { animate, motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, MapPin, Clock, Briefcase } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DoctorData {
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  availability: string;
  experience: string;
  location: string;
  type: string;
  img: string;
  description?: string;
}

interface CardsSliderProps {
  doctors: DoctorData[];
}

export function CardsSlider({ doctors }: CardsSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(
        containerRef.current.scrollWidth - containerRef.current.offsetWidth
      );
    }
  }, [doctors]);

  const scrollTo = (direction: "left" | "right") => {
    const currentX = x.get();
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const scrollAmount = containerWidth * 0.8;

    let newX =
      direction === "left" ? currentX + scrollAmount : currentX - scrollAmount;

    newX = Math.max(Math.min(newX, 0), -width);

    animate(x, newX, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 1,
    });
  };

  return (
    <div className="w-full relative group/slider">
      {/* Navigation Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => scrollTo("left")}
          className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all active:scale-95 text-black"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => scrollTo("right")}
          className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all active:scale-95 text-black"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <motion.div
        ref={containerRef}
        className="cursor-grab active:cursor-grabbing overflow-visible px-4 py-20 -mx-4 -my-20"
        whileTap={{ cursor: "grabbing" }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ right: 0, left: -width }}
          dragElastic={0.1}
          style={{ x }}
          className="flex gap-6"
        >
          {doctors.map((doctor, index) => (
            <motion.div
              key={index}
              className="min-w-[320px] max-w-[320px] h-[450px]"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Card className="group relative h-full overflow-hidden rounded-[2.5rem] border-gray-100 bg-white transition-all duration-500 hover:border-black/5 hover:shadow-2xl hover:shadow-black/5">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                  <motion.img
                    src={doctor.img}
                    alt={doctor.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

                  <div className="absolute top-4 left-4">
                    <Badge
                      className="bg-white/90 backdrop-blur-md text-black border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm"
                    >
                      {doctor.specialty}
                    </Badge>
                  </div>

                  {doctor.rating >= 4.9 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-emerald-500 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-lg">
                        Top Rated
                      </Badge>
                    </div>
                  )}

                  {/* Hover Overlay Action */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black shadow-xl"
                    >
                      Book Appointment
                    </motion.button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col h-[calc(100%-14rem)] justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black leading-tight tracking-tighter text-black transition-colors group-hover:text-gray-600">
                        {doctor.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-black">{doctor.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Briefcase size={12} />
                        <span>{doctor.experience}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <MapPin size={12} />
                        <span>{doctor.location}</span>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm text-gray-500 font-medium leading-relaxed">
                      Leading specialist in {doctor.specialty.toLowerCase()} with a focus on patient-centered care and modern treatments.
                    </p>
                  </div>

                  <div className="pt-4 mt-auto border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Availability</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${doctor.availability === 'Today' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-xs font-bold text-black">{doctor.availability}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-xl">
                      <Clock className="h-3 w-3" />
                      <span>{doctor.type}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
