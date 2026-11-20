import { QuoteGame } from "@/components/modes/QuoteGame";
import { modeMetadata } from "@/lib/metadata";

export const generateMetadata = modeMetadata("quote");

export default function Page() {
  return <QuoteGame />;
}
