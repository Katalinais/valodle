import { SkinGame } from "@/components/modes/SkinGame";
import { modeMetadata } from "@/lib/metadata";

export const generateMetadata = modeMetadata("skin");

export default function Page() {
  return <SkinGame />;
}
