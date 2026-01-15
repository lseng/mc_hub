import svgPaths from "../imports/svg-fv163o9m0l";
import imgMcLeaderHubHeader from "figma:asset/6d7ab19740ef6b30f3b5b07257a47086fbaf00e7.png";

export function MCHubHeader() {
  return (
    <div
      className="bg-center bg-cover bg-no-repeat h-[80px] relative rounded-lg shrink-0 w-full"
      style={{ backgroundImage: `url('${imgMcLeaderHubHeader}')` }}
    >
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2 h-[80px] items-center justify-center p-[6px] relative w-full">
          <div className="font-['Inter:Extra_Bold_Italic',_sans-serif] font-extrabold italic leading-[0] relative text-[28px] text-left text-neutral-50 uppercase">
            <p className="block leading-[normal]">MC Hub</p>
          </div>
        </div>
      </div>
    </div>
  );
}