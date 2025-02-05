import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { signInWithGoogle } from "@/service/aujth.service";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

const PremiumVisualCTA = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (!user) {
      signInWithGoogle(router);
    } else {
      router.push("/dashboard");
    }
  };
  return (
    <div className="w-full flex flex-col md:flex-row text-center p-10 md:mt-16 rounded-lg shadow-lg">
      <div className="w-full flex flex-col justify-center items-center z-10">
        <h2 className="text-black text-[2rem] font-bold md:text-[4rem]">
          Unlock the Power of Visual Feedback
        </h2>
        <p className="text-gray-500 text-[1.5rem] text-balance mt-2 max-w-xl mx-auto">
          Upgrade to premium and visualize your project's feedback like never
          before! Manage feedback with a Kanban board, gain insights, and take
          full control.
        </p>
        <Button
          size={"lg"}
          onClick={handleGetStarted}
          className="mt-6 uppercase text-white font-semibold rounded-lg transition"
        >
          Try Visual View
        </Button>
      </div>
      <div className="md:w-9/12 mt-10 w-full md:mt-0 rounded-lg overflow-hidden">
        <Image
          src="/MacBook_Pro_mockuo.png" // Replace with your image URL
          alt="Visual CTO Image Big"
          layout="responsive"
          width={1200}
          height={500}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default PremiumVisualCTA;
