import { AlumniFormEditor } from "@/components/admin/alumni-form-editor";

interface EditAlumniPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAlumniPage({ params }: EditAlumniPageProps) {
  const { id } = await params;
  return <AlumniFormEditor initialId={id} />;
}

