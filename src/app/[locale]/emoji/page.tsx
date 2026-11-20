import { EmojiGame } from "@/components/modes/EmojiGame";
import { modeMetadata } from "@/lib/metadata";

export const generateMetadata = modeMetadata("emoji");

export default function Page() {
  return <EmojiGame />;
}
