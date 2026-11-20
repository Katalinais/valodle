import { MapGame } from "@/components/modes/MapGame";
import { modeMetadata } from "@/lib/metadata";

export const generateMetadata = modeMetadata("map");

export default function Page() {
  return <MapGame />;
}
