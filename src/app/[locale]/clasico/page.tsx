import { ClassicGame } from "@/components/modes/ClassicGame";
import { modeMetadata } from "@/lib/metadata";

export const generateMetadata = modeMetadata("classic");

export default function ClassicPage() {
  return <ClassicGame />;
}
