import { Ai } from "./components/Ai";
import { News } from "./components/News";
import { Plenaries } from "./components/Plenaries";
import { Procedures } from "./components/Procedures";
import { Section1 } from "./components/Section1";

export default function Home() {
  return (
    <div className="flex flex-col gap-2 lg:gap-8">
      <Section1 />
      <div className="flex flex-col items-center justify-between gap-2 lg:flex-row lg:gap-8">
        <Plenaries />
        <Procedures />
      </div>
      <div className="flex flex-col items-center justify-between gap-2 lg:flex-row lg:gap-8">
        <News />
        <Ai />
      </div>
    </div>
  );
}
