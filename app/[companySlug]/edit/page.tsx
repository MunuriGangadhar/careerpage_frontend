import type { Metadata } from 'next';

import EditorShell from '@/app/components/editor/EditorShell';

export const metadata: Metadata = {
  title: 'Edit Careers Page',
  robots: { index: false, follow: false },
};

export default function EditPage() {
  return <EditorShell />;
}