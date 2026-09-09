import { Metadata } from "next";
import { generateTalentProfileMetadata } from "@/lib/talent-metadata";

interface Props {
  params: Promise<{
    id: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return generateTalentProfileMetadata(id);
}

export default function TalentProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

