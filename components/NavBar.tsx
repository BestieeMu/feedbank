import React from "react";
import { Button } from "./ui/button";
import { signInWithGoogle } from "@/service/aujth.service";

const NavBar = () => {
  return (
    <header className="py-7 w-full bg-white ">
      <div className="flex justify-between max-w-5xl mx-auto">
        <h3 className="text-2zl font-bold">FeedBank</h3>
        <div><Button  onClick={signInWithGoogle}>Sign In</Button></div>
      </div>
    </header>
  );
};

export default NavBar;
