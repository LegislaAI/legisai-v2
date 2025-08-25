import AiChat from "@/components/ai/page";
import Tutorials from "../tutorials/page";
import { Section1 } from "./components/Section1";

export default function Home() {
  return (
    <div className="flex flex-col gap-2 xl:gap-8">
      <Section1 />
      <div className="flex w-full gap-2 xl:gap-8">
        <AiChat />
      </div>
      {/* <div className="flex flex-col items-center justify-between gap-2 lg:grid lg:grid-cols-2 xl:gap-8">
        <Plenaries />
        <Procedures />
      </div> */}
      {/* <div className="flex flex-col items-center justify-between gap-2 lg:grid lg:grid-cols-2 xl:gap-8">
        <News />
         <Ai /> 
      </div> */}
      <div className="flex w-full gap-2 xl:gap-8">
        <Tutorials />
      </div>
    </div>
  );
}
