import { AbilityGame } from "@/components/modes/AbilityGame";
import { modeMetadata } from "@/lib/metadata";

export const generateMetadata = modeMetadata("ability");

export default function Page() {
  return <AbilityGame />;
}
