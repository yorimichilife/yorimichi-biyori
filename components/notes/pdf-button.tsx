"use client";

import { Button } from "@/components/ui";

export function PdfButton() {
  return (
    <Button variant="secondary" className="w-full" onClick={() => window.print()}>
      PDFを作成する
    </Button>
  );
}
