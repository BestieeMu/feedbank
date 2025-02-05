import React from "react";
import { Button } from "./ui/button";
import { signInWithGoogle } from "@/service/aujth.service";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const router = useRouter();
  return (
    <header className="py-7 w-full bg-white ">
      <div className="flex justify-between max-w-5xl mx-auto">
        <h3 className="text-2zl font-bold">FeedBank</h3>
        <div><Button  onClick={()=> signInWithGoogle(router)}>Sign In</Button></div>
      </div>
    </header>
  );
};

export default NavBar;
