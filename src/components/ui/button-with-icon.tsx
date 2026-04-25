import React from "react";
import { Button, type ButtonProps } from "./button";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonWithIconProps extends ButtonProps {}

const ButtonWithIcon = ({ children, className, ...props }: React.ComponentProps<typeof Button>) => {
  return (
    <Button 
      className={cn(
        "relative text-sm font-medium rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden cursor-pointer bg-black text-white hover:bg-black/90",
        className
      )}
      {...props}
    >
      <span className="relative z-10 transition-all duration-500">
        {children}
      </span>
      <div className="absolute right-1 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45">
        <ArrowUpRight size={16} />
      </div>
    </Button>
  );
};

export default ButtonWithIcon;
