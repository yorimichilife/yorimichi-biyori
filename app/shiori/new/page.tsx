import Link from "next/link";
import { Container } from "@/components/ui";
import { ShioriForm } from "@/components/planner/shiori-form";

export default function ShioriNewPage() {
  return (
    <Container className="space-y-8 py-8 md:py-12">
      <Link href="/" className="text-sm font-medium text-brand-sky">
        ← ホームに戻る
      </Link>
      <ShioriForm />
    </Container>
  );
}
