import { Card, Container } from "@/components/ui";
import { LoginRequiredCard } from "@/components/auth/login-required-card";
import { getNotesByUser } from "@/lib/notes-store";
import { getSessionUser } from "@/lib/session";
import { unstable_noStore as noStore } from "next/cache";
import { NotesBrowser } from "@/components/notes/note-browser";

export default async function NotesPage() {
  noStore();
  const user = await getSessionUser();
  const notes = user ? await getNotesByUser(user.id) : [];

  return (
    <Container className="py-6 md:py-12">
      <Card className="p-4 md:p-8">
        {user ? (
          <NotesBrowser notes={notes} />
        ) : (
          <LoginRequiredCard
            title="よりみち日記は会員専用です"
            body="自分だけのよりみち日記を残したり、下書きを育てたり、公開範囲を整えたり。思い出を日記のように残す機能は、ログイン後に使えます。"
          />
        )}
      </Card>
    </Container>
  );
}
