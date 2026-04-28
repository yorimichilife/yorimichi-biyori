import { Container } from "@/components/ui";
import { getPublicNotes } from "@/lib/notes-store";
import { unstable_noStore as noStore } from "next/cache";
import { BlogBrowser } from "@/components/notes/blog-browser";

export default async function BlogPage() {
  noStore();
  const notes = await getPublicNotes();

  return (
    <Container className="space-y-8 py-8 md:py-12">
      <BlogBrowser notes={notes} />
    </Container>
  );
}
